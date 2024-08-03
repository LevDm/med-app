import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';

import { UserSearchService } from './user-search.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const host = configService.get('ELASTIC_HOST') ?? 'localhost';
        const port = configService.get('ELASTIC_PORT') ?? '9200';

        return {
          node: `http://${host}:${port}`,
        };
      },
      inject: [ConfigService],
      imports: [ConfigModule],
    }),
  ],
  providers: [UserSearchService],
  exports: [UserSearchService],
})
export class UserSearchModule {}
