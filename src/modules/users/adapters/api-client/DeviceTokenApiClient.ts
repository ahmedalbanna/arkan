
'use client';

import { injectable } from "tsyringe";
import { apiService } from "@/infrastructure/api/ApiService";

@injectable()
export class DeviceTokenApiClient {
  async saveDeviceToken(userId: string, token: string): Promise<void> {
    return apiService({
        endpoint: '/api/fcm',
        method: 'POST',
        data: { userId, token }
    });
  }
}
