import { Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

import { User } from '@prisma/client';

type UserSearchBody = {
  name: string;
  email: string;
};

interface UserSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: UserSearchBody;
    }>;
  };
}

@Injectable()
export class UserSearchService {
  private index = 'users';

  constructor(private readonly elasticsearchService: ElasticsearchService) {}

  private async createIndex() {
    return this.elasticsearchService.indices.create({
      index: this.index,
      mappings: {
        properties: {
          name: { type: 'text' },
          email: { type: 'text' },
        },
      },
    });
  }

  async indexUser(user: User) {
    const isExists = await this.elasticsearchService.indices.exists({ index: this.index });

    if (!isExists) {
      await this.createIndex();
    }

    const userIndex = await this.elasticsearchService.index<UserSearchBody>({
      index: this.index,
      id: user.id,
      body: {
        name: `${user.lastName} ${user.firstName}`,
        email: user.email,
      },
    });
    Logger.log(`Create index for the user with id = ${user.id}`);
    return userIndex;
  }

  async search(text: string) {
    const response = await this.elasticsearchService.search<UserSearchResult, UserSearchBody>({
      index: this.index,
      body: {
        query: {
          multi_match: {
            query: text,
            fields: ['name', 'email'],
            operator: 'and',
            fuzziness: 'AUTO',
          },
        },
      },
    });

    const hits = response.hits.hits;
    return hits.map((item) => item._id);
  }
}
