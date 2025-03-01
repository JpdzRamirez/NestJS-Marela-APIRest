import { Injectable } from '@nestjs/common';
import { createHash } from "crypto";

import { PostAllClientsDto } from '../../modules/clients/dto/post-AllClients.dto';
import { Client } from '../../modules/clients/client.entity';
import { TypeClient } from '../../modules/type_client/type_client.entity';
import { TypeDocument } from '../../modules/type_document/type_document.entity';

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

      mapDtoToClientEntity(dto: PostAllClientsDto): Client {
        const client = new Client();
    
        client.id_mobil = dto.id;
        client.nombre = dto.nombre;
        client.apellido = dto.apellido;
        client.correo = dto.correo;
        client.documento = dto.numerodocumento;
        client.direccion = dto.direccion;
        client.telefono = dto.telefono;
        client.sincronizado_mobil = dto.sincronizadoMobil;
        client.sincronizado_web = dto.sincronizadoWeb;
    
        // Mapear relaciones ManyToOne
        client.tipo_cliente = { id: dto.tipoCliente } as TypeClient;
        client.tipo_documento = { id: dto.tipoDocumento } as TypeDocument;
    
        return client;
      }
}
