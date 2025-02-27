import { Injectable } from '@nestjs/common';
import { createHash } from "crypto";

@Injectable()
export class UtilityService {
    generateAuthCode(length = 5): string {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let code = '';
        for (let i = 0; i < length; i++) {
          code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
      }
      
      hashMD5(text: string): string {
        return createHash("md5").update(text).digest("hex");
      }
      
      verificarHash(entrada: string, hashEsperado: string): boolean {
        return this.hashMD5(entrada) === hashEsperado;
      }
}
