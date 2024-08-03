import { Injectable } from '@nestjs/common';

import { DatabaseService } from '../database/database.service';

@Injectable()
export class YandexDiskService {
  private apiUrl = 'https://cloud-api.yandex.net/';

  constructor(private databaseService: DatabaseService) {}

  public async getSyncLink(userId: string) {
    return this.databaseService.yandexDiskIntegration.findUnique({ where: { userId } });
  }

  public async addSyncLink({ userId, shareLink }: { userId: string; shareLink: string }) {
    return this.databaseService.yandexDiskIntegration.upsert({
      create: { userId, shareLink },
      update: { shareLink },
      where: { userId },
    });
  }

  public async updateSyncLink({ userId, shareLink }: { userId: string; shareLink: string }) {
    return this.databaseService.yandexDiskIntegration.upsert({
      where: { userId },
      update: { shareLink, syncDate: null },
      create: { userId, shareLink },
    });
  }

  public async deleteSyncLink(userId: string) {
    return this.databaseService.yandexDiskIntegration.delete({ where: { userId } });
  }

  public async updateSyncDate(userId: string, syncDate: Date) {
    return this.databaseService.yandexDiskIntegration.update({ where: { userId }, data: { syncDate } });
  }

  public async getMetadata(userId: string) {
    const { shareLink, syncDate } = (await this.getSyncLink(userId)) ?? {};

    if (!shareLink) return { hasLink: false };

    const url = new URL(`v1/disk/public/resources/?public_key=${shareLink}`, this.apiUrl);

    const response = await fetch(url);
    const metadata: { modified: string } | { error: string } = await response.json();

    if ('error' in metadata) {
      return { hasLink: false };
    }

    const actualDate = new Date(metadata.modified);

    return { hasLink: true, isOutdated: syncDate?.getTime() !== actualDate.getTime(), actualDate };
  }

  public async downloadFile(userId: string) {
    const { shareLink } = (await this.databaseService.yandexDiskIntegration.findUnique({ where: { userId } })) ?? {};

    if (!shareLink) return null;

    const url = new URL(`v1/disk/public/resources/download/?public_key=${shareLink}`, this.apiUrl);

    const downloadLinkResponse = await fetch(url);
    const { href }: { href: string } = await downloadLinkResponse.json();

    const response = await fetch(href);
    const arrayBuffer = await response.arrayBuffer();

    return Buffer.from(arrayBuffer);
  }
}
