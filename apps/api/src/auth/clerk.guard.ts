import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { verifyToken } from '@clerk/backend';

@Injectable()
export class ClerkGuard implements CanActivate {
    private readonly logger = new Logger(ClerkGuard.name);
    private secretKey: string | undefined;

    constructor(private configService: ConfigService) {
        this.secretKey = this.configService.get<string>('CLERK_SECRET_KEY');
        if (!this.secretKey) {
            this.logger.error('CLERK_SECRET_KEY is missing in environment variables');
        }
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            this.logger.warn('No authorization header found');
            throw new UnauthorizedException('No authorization header found');
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            this.logger.warn('Malformed authorization header');
            throw new UnauthorizedException('Malformed authorization header');
        }

        try {
            const decoded = await verifyToken(token, {
                secretKey: this.secretKey,
            });
            request['user'] = decoded;
            return true;
        } catch (err) {
            this.logger.error(`Clerk token verification failed: ${err.message}`);
            // Provide more specific error msg if possible for easier debugging
            throw new UnauthorizedException(`Invalid or expired token: ${err.message}`);
        }
    }
}
