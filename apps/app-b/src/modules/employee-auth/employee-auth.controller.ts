import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { HelperFormatResponseService } from '@core-common/helpers/services/helper-format-response.service';
import { EmployeeRequest } from '@core-modules/employee-auth/employee-request.types';
import { RefreshTokenUseCase } from '@core-modules/employee-auth/usecases/refresh-token.usecase';
import { SignInUseCase } from '@core-modules/employee-auth/usecases/sign-in.usecase';

import { SignInRequestDto } from './dtos/requests/sign-in-request.dto';
import { TokenResponse } from './dtos/responses/token-response.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('/auth')
export class EmployeeAuthController {
  constructor(
    private readonly signInUseCase: SignInUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly helperFormatResponseService: HelperFormatResponseService,
  ) {}

  @Post('/sign-in')
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body()
    body: SignInRequestDto,
  ) {
    const tokenResponse = await this.signInUseCase.execute(body);

    return this.helperFormatResponseService.detail({
      data: new TokenResponse({ ...tokenResponse }),
      message: 'Sign in successfully!',
    });
  }

  @Post('/refresh-token')
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Request() request: EmployeeRequest) {
    const tokenResponse = await this.refreshTokenUseCase.execute({
      sessionId: request.user.sessionId,
      hash: request.user.hash,
    });

    return this.helperFormatResponseService.detail({
      data: new TokenResponse({ ...tokenResponse }),
      message: 'Refresh token successfully!',
    });
  }
}
