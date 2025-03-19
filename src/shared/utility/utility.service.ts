import { Injectable } from '@nestjs/common';
import { createHash } from "crypto";

import { ClientsDto } from '../../modules/clients/dto/Clients.dto';
import { TypeClientDto } from '../../modules/type_client/dto/typeClient.dto';
import { TypeDocumentDto } from '../../modules/type_document/dto/typeDocument.dto';

import { WaterMeter } from '../../modules/meters/meters.entity';
import { Brand } from 'src/modules/brands/brand.entity';
import { WaterMetersDto } from '../../modules/meters/dto/meters.dto';

import { Contract } from '../../modules/contracts/contract.entity';

import { Client } from '../../modules/clients/client.entity';
import { TypeClient } from '../../modules/type_client/type_client.entity';
import { TypeDocument } from '../../modules/type_document/type_document.entity';
import { MunicipalUnit } from '../../modules/municipal_unit/municipal_unit.entity';
import { City } from '../../modules/cities/city.entity';
import { CityDto } from '../../modules/cities/dto/cities.dto';
import { State } from '../../modules/states/state.entity';
import { MunicipalUnitDto } from '../../modules/municipal_unit/dto/municipal_unit.dto';


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

    mapDtoClientToEntityAndRemoveDuplicate(clientArray: ClientsDto[], uuid_authsupa: string):
    { uniqueClients: Client[], 
      duplicateClients: ClientsDto[] 
    } {
        const uniqueClients = new Map<string, Client>();
        const duplicateClients: ClientsDto[] = [];
    
        for (const client of clientArray) {
            // Creamos el nombre clave para realizar la validacion si está repetido
            const referenceKey = client.numeroDocumento.toString().trim();

            if (uniqueClients.has(referenceKey)) {
              client.source_failure='Request'
              duplicateClients.push({ ...client }); // Guardar duplicado
            } else {
              let newClient = new Client();
              newClient.id = client.id;
              newClient.id_cliente = client.id_cliente;
              newClient.nombre = client.nombre;
              newClient.apellido = client.apellido ?? null;
              newClient.documento = client.numeroDocumento;
              newClient.correo = client.correo;
              newClient.direccion = client.direccion;
              newClient.telefono = client.telefono;          
              newClient.sync_with = [{ id: client.id, uuid_authsupa }];          
              newClient.tipo_cliente = { id_tipocliente: client.tipoCliente } as Partial<TypeClient> as TypeClient;
              newClient.tipo_documento = { id_tipodocumento: client.tipoDocumento } as Partial<TypeDocument> as TypeDocument;
              newClient.unidad_municipal = { id_unidadmunicipal: client.unidadMunicipal } as Partial<MunicipalUnit> as MunicipalUnit; 
              newClient.uploaded_by_authsupa = uuid_authsupa;
        
              uniqueClients.set(referenceKey, { ...newClient });
            }
          }
        
          return {
            uniqueClients: Array.from(uniqueClients.values()),
            duplicateClients,
          };
      }

    mapDtoCityToEntityAndRemoveDuplicate(citiesArray: CityDto[], uuid_authsupa: string):
    { uniqueCities: City[], 
      duplicateCities: CityDto[] 
    } {
          const uniqueCities = new Map<string, City>();
          const duplicateCities: CityDto[] = [];
      
          for (const city of citiesArray) {
              // Creamos el nombre clave para realizar la validacion si está repetido
              const referenceKey = city.id_ciudad.toString().trim();
  
              if (uniqueCities.has(referenceKey)) {
                city.source_failure='Request'
                duplicateCities.push({ ...city }); // Guardar duplicado
              } else {
                let newCity = new City();
                newCity.id = city.id;
                newCity.id_ciudad = city.id_ciudad;
                newCity.nombre = city.nombre;
                newCity.codigo = city.codigo ?? null;
                newCity.sync_with = [{ id: city.id, uuid_authsupa }];          
                newCity.uploaded_by_authsupa = uuid_authsupa;
          
                uniqueCities.set(referenceKey, { ...newCity });
              }
            }
          
            return {
              uniqueCities: Array.from(uniqueCities.values()),
              duplicateCities,
            };
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
              waterMeter.source_failure='Request'
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
              newWaterMeter.marca = { id_marca: waterMeter.marca_id } as Partial<Brand> as Brand;   
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

    mapDtoMunicipalUnitToEntityAndRemoveDuplicate(municipal_unitArray: MunicipalUnitDto[], uuid_authsupa: string): 
    { uniqueMunicipalUnits: MunicipalUnit[], 
      duplicateMunicipalUnits: MunicipalUnitDto[] 
    } {
      const uniqueMunicipalUnits = new Map<string, MunicipalUnit>();
      const duplicateMunicipalUnits: MunicipalUnitDto[] = [];
  
      for (const municipal_unit of municipal_unitArray) {
          // Creamos el nombre clave para realizar la validacion si está repetido
          const referenceKey = municipal_unit.id_unidadmunicipal.toString().trim();

          if (uniqueMunicipalUnits.has(referenceKey)) {
            municipal_unit.source_failure='Request'
            duplicateMunicipalUnits.push({ ...municipal_unit }); // Guardar duplicado
          } else {
            let newMunicipalUnit = new MunicipalUnit();
            newMunicipalUnit.id = municipal_unit.id;
            newMunicipalUnit.id_unidadmunicipal = municipal_unit.id_unidadmunicipal;
            newMunicipalUnit.nombre = municipal_unit.nombre;
            newMunicipalUnit.ciudad = { id_ciudad: municipal_unit.ciudad_id } as Partial<City> as City;   
            newMunicipalUnit.departamento = { id_departamento: municipal_unit.departamento_id } as Partial<State> as State; 
            newMunicipalUnit.uploaded_by_authsupa = uuid_authsupa;
      
            // Construir el arreglo sync_with
            newMunicipalUnit.sync_with = [{ id: municipal_unit.id, uuid_authsupa }];
      
            uniqueMunicipalUnits.set(referenceKey, { ...newMunicipalUnit });
          }
        }
      
        return {
          uniqueMunicipalUnits: Array.from(uniqueMunicipalUnits.values()),
          duplicateMunicipalUnits,
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
    /*Eliminar posibles datos redundantes al patch de medidores de agua*/
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
    removeDuplicateMunicipalUnits(municipal_unitArray: MunicipalUnitDto[]) {
      const uniqueMunicipalUnits = new Map<string, MunicipalUnitDto>();
      const duplicateMunicipalUnits: MunicipalUnitDto[] = [];
    
      for (const municipal_unit of municipal_unitArray) {
        // Normalizar el nombre para comparar sin errores
        const referenceKey = municipal_unit.id_unidadmunicipal.toString().trim();
    
        if (uniqueMunicipalUnits.has(referenceKey)) {
          municipal_unit.source_failure='Request'
          duplicateMunicipalUnits.push({ ...municipal_unit });
        } else {
          uniqueMunicipalUnits.set(referenceKey, { ...municipal_unit });
        }
      }
    
      return {
        uniqueMunicipalUnits: Array.from(uniqueMunicipalUnits.values()),
        duplicateMunicipalUnits,
      };
    }
    /*Eliminar posibles datos redundantes al patch de clientes*/
    removeDuplicateClients(clientsArray: ClientsDto[]) {
          const uniqueClients = new Map<string, ClientsDto>();
          const duplicateClients: ClientsDto[] = [];
        
          for (const client of clientsArray) {
            // Normalizar el nombre para comparar sin errores
            const referenceKey = client.numeroDocumento.toString().trim();
        
            if (uniqueClients.has(referenceKey)) {
              client.source_failure='Request'
              duplicateClients.push({ ...client });
            } else {
              uniqueClients.set(referenceKey, { ...client });
            }
          }
        
          return {
            uniqueClients: Array.from(uniqueClients.values()),
            duplicateClients,
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
    
}


