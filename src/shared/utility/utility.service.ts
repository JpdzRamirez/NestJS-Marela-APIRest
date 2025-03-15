import { Injectable } from '@nestjs/common';
import { createHash } from "crypto";

import { ClientsDto } from '../../modules/clients/dto/Clients.dto';
import { TypeClientDto } from '../../modules/type_client/dto/typeClient.dto';
import { TypeDocumentDto } from '../../modules/type_document/dto/typeDocument.dto';

import { WaterMeter } from '../../modules/meters/meters.entity';
import { WaterMetersDto } from '../../modules/meters/dto/meters.dto';

import { Contract } from '../../modules/contracts/contract.entity';

import { Client } from '../../modules/clients/client.entity';
import { TypeClient } from '../../modules/type_client/type_client.entity';
import { TypeDocument } from '../../modules/type_document/type_document.entity';
import { Brand } from 'src/modules/brands/brand.entity';

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

    mapDtoClientToEntity(clientArray: ClientsDto[], uuid_authsupa: string): Client[] {
        const uniqueClient:Client[]=[];        
        for (const client of clientArray) {
          let newClient = new Client();
          newClient.id = client.id;
          newClient.id_cliente = client.id_cliente;
          newClient.nombre = client.nombre;
          newClient.apellido = client.apellido;
          newClient.documento = client.numeroDocumento;
          newClient.correo = client.correo;
          newClient.direccion = client.direccion;
          newClient.telefono = client.telefono;          
          newClient.sync_with = [{ id: newClient.id, uuid_authsupa }];          
          newClient.tipo_cliente = { id_tipocliente: client.tipoCliente } as Partial<TypeClient> as TypeClient;
          newClient.tipo_documento = { id_tipodocumento: client.tipoDocumento } as Partial<TypeDocument> as TypeDocument;        
          newClient.uploaded_by_authsupa = uuid_authsupa;
          uniqueClient.push(newClient);
        }
        return uniqueClient;
      }

    mapDtoWaterMeterToEntityAndRemoveDuplicate(waterMeterArray: WaterMetersDto[], uuid_authsupa: string): 
      { uniqueWaterMeters: WaterMeter[], 
        duplicateWaterMeters: WaterMetersDto[] 
      } {
        const uniqueWaterMeters = new Map<string, WaterMeter>();
        const duplicateWaterMeters: WaterMetersDto[] = [];
    
        for (const waterMeter of waterMeterArray) {
            // Creamos el nombre clave para realizar la validacion si está repetido
            const referenceKey = waterMeter.numero_referencia.toString().trim();

            if (uniqueWaterMeters.has(referenceKey)) {
              waterMeter.source_failure='DataBase'
              duplicateWaterMeters.push({ ...waterMeter }); // Guardar duplicado
            } else {
              let newWaterMeter = new WaterMeter();
              newWaterMeter.id = waterMeter.id;
              newWaterMeter.id_medidor = waterMeter.id_medidor;
              newWaterMeter.numero_referencia = waterMeter.numero_referencia;
              newWaterMeter.tipo = waterMeter.tipo;
              newWaterMeter.modelo = waterMeter.modelo;
              newWaterMeter.diametro = waterMeter.diametro;
              newWaterMeter.descripcion = waterMeter.descripcion;
              newWaterMeter.marca = { id_medidor: waterMeter.marca_id } as Partial<Brand> as Brand;   
              newWaterMeter.contrato = { id_contrato: waterMeter.contrato_id } as Partial<Contract> as Contract; 
              newWaterMeter.uploaded_by_authsupa = uuid_authsupa;
        
              // Construir el arreglo sync_with
              newWaterMeter.sync_with = [{ id: waterMeter.id, uuid_authsupa }];
        
              uniqueWaterMeters.set(referenceKey, { ...newWaterMeter });
            }
          }
        
          return {
            uniqueWaterMeters: Array.from(uniqueWaterMeters.values()),
            duplicateWaterMeters,
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
    
    removeDuplicateWaterMeter(waterMeterArray: WaterMetersDto[]) {
      const uniqueWaterMeters = new Map<string, WaterMetersDto>();
      const duplicateWaterMeters: WaterMetersDto[] = [];
    
      for (const waterMeter of waterMeterArray) {
        // Normalizar el nombre para comparar sin errores
        const referenceKey = waterMeter.numero_referencia.toString().trim();
    
        if (uniqueWaterMeters.has(referenceKey)) {
          waterMeter.source_failure='Request'
          duplicateWaterMeters.push({ ...waterMeter });
        } else {
          uniqueWaterMeters.set(referenceKey, { ...waterMeter });
        }
      }
    
      return {
        uniqueWaterMeters: Array.from(uniqueWaterMeters.values()),
        duplicateWaterMeters,
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

    
}
