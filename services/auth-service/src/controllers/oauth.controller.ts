import { Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../server';

// Validation schemas
const tokenRequestSchema = z.object({
  grant_type: z.enum(['authorization_code', 'refresh_token']),
  code: z.string().optional(),
  redirect_uri: z.string().optional(),
  client_id: z.string(),
  client_secret: z.string(),
  refresh_token: z.string().optional(),
});

export async function authorize(req: Request, res: Response) {
  try {
    const { client_id, redirect_uri, response_type, scope, state } = req.query;

    if (response_type !== 'code') {
      return res.status(400).json({
        success: false,
        error: 'unsupported_response_type',
        message: 'Only authorization code flow is supported',
      });
    }

    // Verify client
    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: client_id as string },
    });

    if (!client || !client.isActive) {
      return res.status(400).json({
        success: false,
        error: 'invalid_client',
        message: 'Client not found or inactive',
      });
    }

    const redirectUris = client.redirectUris as string[];
    if (!redirectUris.includes(redirect_uri as string)) {
      return res.status(400).json({
        success: false,
        error: 'invalid_redirect_uri',
        message: 'Redirect URI not registered',
      });
    }

    // For now, return a simple authorization page info
    // In production, this would render an authorization consent page
    return res.json({
      success: true,
      data: {
        client_name: client.name,
        scopes: scope ? (scope as string).split(' ') : [],
        redirect_uri,
        state,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Authorization failed',
    });
  }
}

export async function token(req: Request, res: Response) {
  try {
    const validation = tokenRequestSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        details: validation.error.errors,
      });
    }

    const { grant_type, code, client_id, client_secret, refresh_token } = validation.data;

    // Verify client credentials
    const client = await prisma.oAuthClient.findUnique({
      where: { clientId: client_id },
    });

    if (!client || client.clientSecret !== client_secret || !client.isActive) {
      return res.status(401).json({
        success: false,
        error: 'invalid_client',
      });
    }

    if (grant_type === 'authorization_code') {
      if (!code) {
        return res.status(400).json({
          success: false,
          error: 'invalid_request',
          message: 'Authorization code is required',
        });
      }

      const authCode = await prisma.authorizationCode.findUnique({
        where: { code },
      });

      if (!authCode || authCode.clientId !== client_id) {
        return res.status(400).json({
          success: false,
          error: 'invalid_grant',
          message: 'Invalid authorization code',
        });
      }

      if (authCode.expiresAt < new Date()) {
        await prisma.authorizationCode.delete({ where: { id: authCode.id } });
        return res.status(400).json({
          success: false,
          error: 'invalid_grant',
          message: 'Authorization code expired',
        });
      }

      // Delete used authorization code
      await prisma.authorizationCode.delete({ where: { id: authCode.id } });

      // Generate tokens
      const accessToken = crypto.randomBytes(32).toString('hex');
      const newRefreshToken = crypto.randomBytes(32).toString('hex');

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await prisma.oAuthToken.create({
        data: {
          accessToken,
          refreshToken: newRefreshToken,
          clientId: client_id,
          userId: authCode.userId,
          scopes: authCode.scopes,
          expiresAt,
        },
      });

      return res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        scope: (authCode.scopes as string[]).join(' '),
      });
    }

    if (grant_type === 'refresh_token') {
      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'invalid_request',
          message: 'Refresh token is required',
        });
      }

      const existingToken = await prisma.oAuthToken.findUnique({
        where: { refreshToken: refresh_token },
      });

      if (!existingToken || existingToken.clientId !== client_id) {
        return res.status(400).json({
          success: false,
          error: 'invalid_grant',
          message: 'Invalid refresh token',
        });
      }

      // Delete old token
      await prisma.oAuthToken.delete({ where: { id: existingToken.id } });

      // Generate new tokens
      const newAccessToken = crypto.randomBytes(32).toString('hex');
      const newRefreshToken = crypto.randomBytes(32).toString('hex');

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      await prisma.oAuthToken.create({
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          clientId: client_id,
          userId: existingToken.userId,
          scopes: existingToken.scopes,
          expiresAt,
        },
      });

      return res.json({
        access_token: newAccessToken,
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: newRefreshToken,
        scope: (existingToken.scopes as string[]).join(' '),
      });
    }

    return res.status(400).json({
      success: false,
      error: 'unsupported_grant_type',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'server_error',
      message: 'Token generation failed',
    });
  }
}

export async function userinfo(req: Request, res: Response) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'invalid_token',
      });
    }

    const accessToken = authHeader.substring(7);
    const oauthToken = await prisma.oAuthToken.findUnique({
      where: { accessToken },
    });

    if (!oauthToken || oauthToken.expiresAt < new Date()) {
      return res.status(401).json({
        success: false,
        error: 'invalid_token',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: oauthToken.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        clinicId: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'user_not_found',
      });
    }

    return res.json({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      clinic_id: user.clinicId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'server_error',
    });
  }
}

export async function revoke(req: Request, res: Response) {
  try {
    const { token, token_type_hint } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'invalid_request',
        message: 'Token is required',
      });
    }

    // Try to find and delete the token
    if (token_type_hint === 'refresh_token') {
      await prisma.oAuthToken.deleteMany({
        where: { refreshToken: token },
      });
    } else {
      await prisma.oAuthToken.deleteMany({
        where: { accessToken: token },
      });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'server_error',
    });
  }
}
