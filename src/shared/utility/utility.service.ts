import { Injectable } from '@nestjs/common';
import { createHash } from "crypto";

import { PostAllClientsDto } from '../../modules/clients/dto/post-AllClients.dto';
import { TypeClientDto } from '../../modules/type_client/dto/typeClient.dto';

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

      mapDtoToTypeClientEntity(dto: TypeClientDto, uuid_authsupa: string): TypeClient {
        const typeClient = new TypeClient();
        typeClient.id=dto.id;
        typeClient.nombre = dto.nombre;
    
        // Asignar el usuario que sube el dato
        typeClient.uploaded_by_authsupa = uuid_authsupa;
    
        // Construir el arreglo sync_with
        typeClient.sync_with = [{ id: dto.id, uuid_authsupa: uuid_authsupa }];
        
        return typeClient;
    }

    removeDuplicatTypeClients(typeClientArray: TypeClientDto[]) {
      const uniqueTypeClient = new Map<string, TypeClientDto>();
      const duplicateTypeClient: TypeClientDto[] = [];
    
      for (const typeClient of typeClientArray) {
        // Normalizar el nombre para comparar sin errores
        const normalizedName = typeClient.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, "") 
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, ""); 
    
        if (uniqueTypeClient.has(normalizedName)) {
          const existingClient = uniqueTypeClient.get(normalizedName)!;
          
          // Comparar cuál está mejor escrita
          if (this.isBetterFormatted(typeClient.nombre, existingClient.nombre)) {
            duplicateTypeClient.push({ ...existingClient }); // Guardar copia del duplicado
            uniqueTypeClient.set(normalizedName, { ...typeClient, nombre: normalizedName }); // Reemplazar por el mejor
          } else {
            duplicateTypeClient.push({ ...typeClient }); // Guardar este en duplicados
          }
        } else {
          uniqueTypeClient.set(normalizedName, { ...typeClient, nombre: normalizedName });
        }
      }
    
      return {
        uniqueTypeClient: Array.from(uniqueTypeClient.values()),
        duplicateTypeClient,
      };
    }
    
    // Función para evaluar cuál nombre está mejor escrito
    isBetterFormatted(newName: string, existingName: string): boolean {
      const newNameScore = this.getNameQualityScore(newName);
      const existingNameScore = this.getNameQualityScore(existingName);
      return newNameScore > existingNameScore;
    }
    
    // Función que asigna una puntuación a los nombres según calidad
    getNameQualityScore(name: string): number {
      let score = 0;
    
      if (/^[A-Z]/.test(name)) score += 2; // Comienza con mayúscula
      if (/^[A-Za-z\s]+$/.test(name)) score += 3; // Solo letras y espacios
      if (!/\s{2,}/.test(name)) score += 1; // No tiene espacios dobles
      if (name.length > 2) score += 1; // No es demasiado corto
    
      return score;
    }
    
}
