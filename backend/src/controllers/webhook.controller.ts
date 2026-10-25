import { Request, Response, NextFunction } from 'express';
import { webhookService } from '../services/webhook.service.js';

export class WebhookController {
  async handleRazorpayWebhook(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const signatureHeader = req.headers['x-razorpay-signature'] as string | undefined;

      // Use rawBody buffer if attached by express verify hook, otherwise serialized body
      const rawBody = (req as any).rawBody || JSON.stringify(req.body);

      const result = await webhookService.processRazorpayWebhook(rawBody, signatureHeader);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
}

export const webhookController = new WebhookController();
