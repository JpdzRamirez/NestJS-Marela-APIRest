import { Injectable } from '@nestjs/common';
import { createHash } from "crypto";

import { ClientsDto } from '../../modules/clients/dto/Clients.dto';
import { TypeClientDto } from '../../modules/type_client/dto/typeClient.dto';
import { TypeDocumentDto } from '../../modules/type_document/dto/typeDocument.dto';


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

      mapDtoClientToEntity(clientArray: ClientsDto[], uuid_authsupa: string): Client[] {
        const uniqueClient:Client[]=[];        
        for (const client of clientArray) {
          let newClient = new Client();
          newClient.id = client.id;
          newClient.id_client = client.id_client;
          newClient.nombre = client.nombre;
          newClient.apellido = client.apellido;
          newClient.documento = client.numeroDocumento;
          newClient.correo = client.correo;
          newClient.direccion = client.direccion;
          newClient.telefono = client.telefono;          
          newClient.sync_with = [{ id: newClient.id, uuid_authsupa }];          
          newClient.tipo_cliente = { id: client.tipoCliente } as TypeClient;
          newClient.tipo_documento = { id: client.tipoDocumento } as TypeDocument;          
          newClient.uploaded_by_authsupa = uuid_authsupa;
          uniqueClient.push(newClient);
        }
        return uniqueClient;
      }

    mapDtoTypeClientToEntityAndRemoveDuplicate(typeClientArray: TypeClientDto[], uuid_authsupa: string): 
      { uniqueTypeClient: TypeClient[], 
        duplicateTypeClient: TypeClientDto[] 
      } {
        const uniqueTypeClient = new Map<string, TypeClient>();
        const duplicateTypeClient: TypeClientDto[] = [];
    
        for (const typeClient of typeClientArray) {
            // Normalizar el nombre para comparación
            const normalizedName = typeClient.nombre
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ") // Normaliza los espacios
                .normalize("NFD") // Descompone caracteres con tilde
                .replace(/[\u0300-\u036f]/g, ""); // Remueve diacríticos
            
            if (uniqueTypeClient.has(normalizedName)) {
                const existingClient = uniqueTypeClient.get(normalizedName)!;
    
                // Comparar cuál está mejor escrita
                if (this.isBetterFormatted(typeClient.nombre, existingClient.nombre)) {
                    duplicateTypeClient.push({ ...existingClient }); // Guardar copia del duplicado
                    let newClient = new TypeClient();
                    newClient.id=typeClient.id;
                    newClient.id_tipocliente=typeClient.id_tipocliente;
                    newClient.nombre = typeClient.nombre;
                    // Asignar el usuario que sube el dato
                    newClient.uploaded_by_authsupa = uuid_authsupa;
        
                    // Construir el arreglo sync_with
                    newClient.sync_with = [{ id: typeClient.id, uuid_authsupa }];
                    uniqueTypeClient.set(normalizedName, { ...newClient }); // Reemplazar por el mejor
                } else {
                  typeClient.source_failure='Request';                  
                  duplicateTypeClient.push({ ...typeClient }); // Guardar este en duplicados
                }
            } else {
                let newClient = new TypeClient();
                newClient.id=typeClient.id;
                newClient.id_tipocliente=typeClient.id_tipocliente;
                newClient.nombre = typeClient.nombre;
                // Asignar el usuario que sube el dato
                newClient.uploaded_by_authsupa = uuid_authsupa;
    
                // Construir el arreglo sync_with
                newClient.sync_with = [{ id: typeClient.id, uuid_authsupa }];
    
                uniqueTypeClient.set(normalizedName, { ...newClient });
            }
        }
    
        return {
            uniqueTypeClient: Array.from(uniqueTypeClient.values()),
            duplicateTypeClient,
        };
    }

    mapDtoToTypeDocumentAndRemoveDuplicateEntity(typeDocumentArray: TypeDocumentDto[], uuid_authsupa: string): 
      { uniqueTypeDocument: TypeDocument[], 
        duplicateTypeDocument: TypeDocumentDto[] 
      } {
        const uniqueTypeDocument = new Map<string, TypeDocument>();
        const duplicateTypeDocument: TypeDocumentDto[] = [];
    
        for (const typeDocument of typeDocumentArray) {
            // Normalizar el nombre para comparación
            const normalizedName = typeDocument.nombre
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ") // Normaliza los espacios
                .normalize("NFD") // Descompone caracteres con tilde
                .replace(/[\u0300-\u036f]/g, ""); // Remueve diacríticos
            
            if (uniqueTypeDocument.has(normalizedName)) {
                const existingClient = uniqueTypeDocument.get(normalizedName)!;
    
                // Comparar cuál está mejor escrita
                if (this.isBetterFormatted(typeDocument.nombre, existingClient.nombre)) {
                  existingClient.id_tipodocumento=typeDocument.id_tipodocumento;
                  duplicateTypeDocument.push({ ...existingClient }); // Guardar copia del duplicado
                    let newClient = new TypeDocument();
                    newClient.id=typeDocument.id;
                    newClient.id_tipodocumento=typeDocument.id_tipodocumento;
                    newClient.nombre = typeDocument.nombre;                    
                    newClient.uploaded_by_authsupa = uuid_authsupa;
        
                    // Construir el arreglo sync_with
                    newClient.sync_with = [{ id: typeDocument.id, uuid_authsupa }];
                    uniqueTypeDocument.set(normalizedName, { ...newClient }); // Reemplazar por el mejor
                } else {
                  typeDocument.source_failure='Request';
                  duplicateTypeDocument.push({ ...typeDocument }); // Guardar este en duplicados
                }
            } else {
                let newClient = new TypeDocument();
                newClient.id=typeDocument.id;
                newClient.id_tipodocumento=typeDocument.id_tipodocumento;
                newClient.nombre = typeDocument.nombre;
                // Asignar el usuario que sube el dato
                newClient.uploaded_by_authsupa = uuid_authsupa;
    
                // Construir el arreglo sync_with
                newClient.sync_with = [{ id: typeDocument.id, uuid_authsupa }];
    
                uniqueTypeDocument.set(normalizedName, { ...newClient });
            }
        }
    
        return {
          uniqueTypeDocument: Array.from(uniqueTypeDocument.values()),
          duplicateTypeDocument,
        };
    }
    removeDuplicateTypeClients(typeClientArray: TypeClientDto[]) {
      const uniqueTypeClient = new Map<string, TypeClientDto>();
      const duplicateTypeClient: TypeClientDto[] = [];
    
      for (const typeClient of typeClientArray) {
        // Normalizar el nombre para comparar sin errores
        const normalizedName = typeClient.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") 
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

    removeDuplicateTypeDocument(typeDocumentArray: TypeDocumentDto[]) {
      const uniqueTypeDocument = new Map<string, TypeDocumentDto>();
      const duplicateTypeDocument: TypeDocumentDto[] = [];
    
      for (const typeDocument of typeDocumentArray) {
        // Normalizar el nombre para comparar sin errores
        const normalizedName = typeDocument.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") 
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, ""); 
    
        if (uniqueTypeDocument.has(normalizedName)) {
          const existingClient = uniqueTypeDocument.get(normalizedName)!;
          
          // Comparar cuál está mejor escrita
          if (this.isBetterFormatted(typeDocument.nombre, existingClient.nombre)) {
            duplicateTypeDocument.push({ ...existingClient }); // Guardar copia del duplicado
            uniqueTypeDocument.set(normalizedName, { ...typeDocument, nombre: normalizedName }); // Reemplazar por el mejor
          } else {
            duplicateTypeDocument.push({ ...typeDocument }); // Guardar este en duplicados
          }
        } else {
          uniqueTypeDocument.set(normalizedName, { ...typeDocument, nombre: normalizedName });
        }
      }
    
      return {
        uniqueTypeDocument: Array.from(uniqueTypeDocument.values()),
        duplicateTypeDocument,
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
