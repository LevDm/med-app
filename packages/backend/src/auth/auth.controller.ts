import { BadRequestException, Body, Controller, HttpStatus, Post, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { GetUser, GetUserId } from './decorators';
import { SignInUserDto, SignUpUserDto } from './dto';
import { TokenDto } from './dto/token.dto';
import { InvalidCredentials, InvalidToken } from './exceptions';
import { AccessGuard, RefreshGuard } from './guards';
import { JwtPayloadWithRefreshToken } from './types';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'Creates new user account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: TokenDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @Post('signup')
  async signUp(@Body() user: SignUpUserDto) {
    try {
      return await this.authService.signUp(user);
    } catch (error) {
      if (error instanceof Error) {
        throw new BadRequestException(error.message);
      }
    }
  }

  @ApiOperation({ summary: 'Logs in the user to account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: TokenDto })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Bad Request' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @Post('signin')
  async signIn(@Body() user: SignInUserDto) {
    try {
      return await this.authService.signIn(user);
    } catch (error) {
      if (error instanceof InvalidCredentials) {
        throw new UnauthorizedException(error.message);
      }
    }
  }

  @ApiOperation({ summary: 'Logs out the user from account' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success' })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @UseGuards(AccessGuard)
  @Post('logout')
  async logout(@GetUserId() userId: string) {
    try {
      await this.authService.logout(userId);
    } catch (error) {
      throw new UnauthorizedException('Credentials incorrect');
    }
  }

  @ApiOperation({ summary: 'Refreshes users token with the provided refresh token' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Success', type: TokenDto })
  @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized' })
  @ApiBearerAuth('Authorization')
  @UseGuards(RefreshGuard)
  @Post('refresh')
  async refreshTokens(@GetUser() user: JwtPayloadWithRefreshToken) {
    try {
      return await this.authService.refreshTokens(user);
    } catch (error) {
      if (error instanceof InvalidToken) {
        throw new UnauthorizedException(error.message);
      }

      throw error;
    }
  }
}
