import { Injectable } from '@nestjs/common';
import { createHash } from "crypto";

import { ClientsDto } from '../../modules/clients/dto/Clients.dto';
import { TypeClientDto } from '../../modules/type_client/dto/typeClient.dto';
import { TypeDocumentDto } from '../../modules/type_document/dto/typeDocument.dto';

import { WaterMeter } from '../../modules/meters/meters.entity';
import { WaterMetersDto } from '../../modules/meters/dto/meters.dto';
import { Brand } from 'src/modules/brands/brand.entity';
import { BrandDto } from 'src/modules/brands/dto/brand.dto';

import { Contract } from '../../modules/contracts/contract.entity';
import { Trail } from '../../modules/trails/trail.entity';
import { TrailDto } from '../../modules/trails/dto/trail.dto';

import { Client } from '../../modules/clients/client.entity';
import { TypeClient } from '../../modules/type_client/type_client.entity';
import { TypeDocument } from '../../modules/type_document/type_document.entity';
import { MunicipalUnit } from '../../modules/municipal_unit/municipal_unit.entity';
import { City } from '../../modules/cities/city.entity';
import { CityDto } from '../../modules/cities/dto/cities.dto';
import { State } from '../../modules/states/state.entity';
import { StateDto } from '../../modules/states/dto/state.dto';
import { MunicipalUnitDto } from '../../modules/municipal_unit/dto/municipal_unit.dto';
import { TypeService } from 'src/modules/type_services/type_service.entity';
import { TypeServiceDto } from 'src/modules/type_services/dto/type_services.dto';


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
    mapDtoStateToEntityAndRemoveDuplicate(statesArray: StateDto[], uuid_authsupa: string):
      { uniqueStates: State[], 
        duplicateStates: StateDto[] 
      } {
            const uniqueStates = new Map<string, State>();
            const duplicateStates: StateDto[] = [];
        
            for (const state of statesArray) {
                // Creamos el nombre clave para realizar la validacion si está repetido
                const referenceKey = state.codigo.toString().trim();
    
                if (uniqueStates.has(referenceKey)) {
                  state.source_failure='Request'
                  duplicateStates.push({ ...state }); // Guardar duplicado
                } else {
                  let newState = new State();
                  newState.id = state.id;
                  newState.id_departamento = state.id_departamento;
                  newState.nombre = state.nombre;
                  newState.codigo = state.codigo ?? null;
                  newState.sync_with = [{ id: state.id, uuid_authsupa }];          
                  newState.uploaded_by_authsupa = uuid_authsupa;
            
                  uniqueStates.set(referenceKey, { ...newState });
                }
              }
            
              return {
                uniqueStates: Array.from(uniqueStates.values()),
                duplicateStates,
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
              const referenceKey = city.codigo.toString().trim();
  
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
            newMunicipalUnit.sync_with = [{ id: municipal_unit.id, uuid_authsupa }];      
            uniqueMunicipalUnits.set(referenceKey, { ...newMunicipalUnit });
          }
        }      
        return {
          uniqueMunicipalUnits: Array.from(uniqueMunicipalUnits.values()),
          duplicateMunicipalUnits,
        };
  }
    mapDtoTrailsAndRemoveDuplicate(trailsArray: TrailDto[], uuid_authsupa: string): 
      { uniqueTrails: Trail[], 
        duplicateTrails: TrailDto[] 
      } {
        const uniqueTrails = new Map<string, Trail>();
        const duplicateTrails: TrailDto[] = [];

        for (const trail of trailsArray) {
            // Creamos el nombre clave para realizar la validacion si está repetido
            const referenceKey = trail.id_ruta.toString().trim();
            if (uniqueTrails.has(referenceKey)) {
              trail.source_failure='Request'
              duplicateTrails.push({ ...trail }); // Guardar duplicado
            } else {
              let newTrail = new Trail();
              newTrail.id = trail.id;
              newTrail.id_ruta = trail.id_ruta;
              newTrail.nombre = trail.nombre;
              newTrail.uploaded_by_authsupa = uuid_authsupa;                  
              newTrail.sync_with = [{ id: trail.id, uuid_authsupa }];      
              uniqueTrails.set(referenceKey, { ...newTrail });
            }
          }      
          return {
            uniqueTrails: Array.from(uniqueTrails.values()),
            duplicateTrails,
          };
    }
    mapDtoTypeServiceAndRemoveDuplicateEntity(typeServicesArray: TypeServiceDto[], uuid_authsupa: string): 
    { uniqueTypeServices: TypeService[], 
      duplicateTypeServices: TypeServiceDto[] 
    } {
      const uniqueTypeServices = new Map<string, TypeService>();
      const duplicateTypeServices: TypeServiceDto[] = [];

      for (const typeService of typeServicesArray) {
          // Normalizar el nombre para comparación
          const normalizedName = typeService.nombre
              .trim()
              .toLowerCase()
              .replace(/\s+/g, " ") 
              .normalize("NFD") 
              .replace(/[\u0300-\u036f]/g, ""); 
          
          if (uniqueTypeServices.has(normalizedName)) {
              const existingBrand= uniqueTypeServices.get(normalizedName)!;
              if (this.isBetterFormatted(typeService.nombre, existingBrand.nombre)) {                  
                  let newTypeService = new TypeService();
                  newTypeService.id=typeService.id;
                  newTypeService.id_tiposervicio=typeService.id_tiposervicio;
                  newTypeService.nombre = typeService.nombre;                    
                  newTypeService.uploaded_by_authsupa = uuid_authsupa;
                  newTypeService.sync_with = [{ id: typeService.id, uuid_authsupa }];
                  uniqueTypeServices.set(normalizedName, { ...newTypeService }); // Reemplazar por el mejor
              } else {
                typeService.source_failure='Request';
                duplicateTypeServices.push({ ...typeService }); // Guardar este en duplicados
              }
          } else {
              let newTypeService = new TypeService();
              newTypeService.id=typeService.id;
              newTypeService.id_tiposervicio=typeService.id_tiposervicio;
              newTypeService.nombre = typeService.nombre;                
              newTypeService.uploaded_by_authsupa = uuid_authsupa;
              newTypeService.sync_with = [{ id: typeService.id, uuid_authsupa }];
              uniqueTypeServices.set(normalizedName, { ...newTypeService });
          }
      }
      return {
        uniqueTypeServices: Array.from(uniqueTypeServices.values()),
        duplicateTypeServices,
      };
  }
  //Filtra por medio de nombres y paretezcos en la tipografía
  mapDtoBrandAndRemoveDuplicateEntity(brandArray: BrandDto[], uuid_authsupa: string): 
      { uniqueBrands: Brand[], 
        duplicateBrands: BrandDto[] 
      } {
        const uniqueBrands = new Map<string, Brand>();
        const duplicateBrands: BrandDto[] = [];

        for (const brand of brandArray) {
            // Normalizar el nombre para comparación
            const normalizedName = brand.nombre
                .trim()
                .toLowerCase()
                .replace(/\s+/g, " ") 
                .normalize("NFD") 
                .replace(/[\u0300-\u036f]/g, ""); 
            
            if (uniqueBrands.has(normalizedName)) {
                const existingBrand= uniqueBrands.get(normalizedName)!;
                if (this.isBetterFormatted(brand.nombre, existingBrand.nombre)) {                  
                    let newBrand = new Brand();
                    newBrand.id=brand.id;
                    newBrand.id_marca=brand.id_marca;
                    newBrand.nombre = brand.nombre;                    
                    newBrand.uploaded_by_authsupa = uuid_authsupa;
                    newBrand.sync_with = [{ id: brand.id, uuid_authsupa }];
                    uniqueBrands.set(normalizedName, { ...newBrand }); // Reemplazar por el mejor
                } else {
                  brand.source_failure='Request';
                  duplicateBrands.push({ ...brand }); // Guardar este en duplicados
                }
            } else {
                let newBrand = new Brand();
                newBrand.id=brand.id;
                newBrand.id_marca=brand.id_marca;
                newBrand.nombre = brand.nombre;                
                newBrand.uploaded_by_authsupa = uuid_authsupa;
                newBrand.sync_with = [{ id: brand.id, uuid_authsupa }];
                uniqueBrands.set(normalizedName, { ...newBrand });
            }
        }
        return {
          uniqueBrands: Array.from(uniqueBrands.values()),
          duplicateBrands,
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
                if (this.isBetterFormatted(typeDocument.nombre, existingClient.nombre)) {                  
                    let newClient = new TypeDocument();
                    newClient.id=typeDocument.id;
                    newClient.id_tipodocumento=typeDocument.id_tipodocumento;
                    newClient.nombre = typeDocument.nombre;                    
                    newClient.uploaded_by_authsupa = uuid_authsupa;
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
                newClient.uploaded_by_authsupa = uuid_authsupa;                
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
                  let newClient = new TypeClient();
                  newClient.id=typeClient.id;
                  newClient.id_tipocliente=typeClient.id_tipocliente;
                  newClient.nombre = typeClient.nombre;
                  newClient.uploaded_by_authsupa = uuid_authsupa;
                  newClient.sync_with = [{ id: typeClient.id, uuid_authsupa }];
                  uniqueTypeClient.set(normalizedName, { ...newClient }); 
              } else {
                typeClient.source_failure='Request';                  
                duplicateTypeClient.push({ ...typeClient }); 
              }
          } else {
              let newClient = new TypeClient();
              newClient.id=typeClient.id;
              newClient.id_tipocliente=typeClient.id_tipocliente;
              newClient.nombre = typeClient.nombre;              
              newClient.uploaded_by_authsupa = uuid_authsupa;              
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
    removeDuplicateTrails(trailsArray: TrailDto[]) {
      const uniqueTrails = new Map<string, TrailDto>();
      const duplicateTrails: TrailDto[] = [];    
      for (const trail of trailsArray) {
        const referenceKey = trail.id_ruta.toString().trim();
        if (uniqueTrails.has(referenceKey)) {
          trail.source_failure='Request'
          duplicateTrails.push({ ...trail });
        } else {
          uniqueTrails.set(referenceKey, { ...trail });
        }
      }
      return {
        uniqueTrails: Array.from(uniqueTrails.values()),
        duplicateTrails,
      };
    }
    removeDuplicateStates(statesArray: StateDto[]) {
      const uniqueStates = new Map<string, StateDto>();
      const duplicateStates: StateDto[] = [];
      for (const state of statesArray) {
        // Normalizar el nombre para comparar sin errores
        const referenceKey = state.id_departamento.toString().trim();    
      if (uniqueStates.has(referenceKey)) {
          state.source_failure='Request'
          duplicateStates.push({ ...state });
        } else {
          uniqueStates.set(referenceKey, { ...state });
        }
      }    
      return {
        uniqueStates: Array.from(uniqueStates.values()),
        duplicateStates,
      };
    }
    removeDuplicateCities(citiesArray: CityDto[]) {
      const uniqueCities = new Map<string, CityDto>();
      const duplicateCities: CityDto[] = [];
    
      for (const city of citiesArray) {
        // Normalizar el nombre para comparar sin errores
        const referenceKey = city.id_ciudad.toString().trim();
    
        if (uniqueCities.has(referenceKey)) {
          city.source_failure='Request'
          duplicateCities.push({ ...city });
        } else {
          uniqueCities.set(referenceKey, { ...city });
        }
      }
    
      return {
        uniqueCities: Array.from(uniqueCities.values()),
        duplicateCities,
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
    
    removeDuplicateTypeServices(typeServicesArray: TypeServiceDto[]) {
      const uniqueTypeServices = new Map<string, TypeServiceDto>();
      const duplicateTypeServices: TypeServiceDto[] = [];   

      for (const typeService of typeServicesArray) {        
        const normalizedName = typeService.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") 
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, "");     
        if (uniqueTypeServices.has(normalizedName)) {
          const existingTypeService = uniqueTypeServices.get(normalizedName)!;                    
          if (this.isBetterFormatted(typeService.nombre, existingTypeService.nombre)) {
            duplicateTypeServices.push({ ...existingTypeService }); 
            uniqueTypeServices.set(normalizedName, { ...typeService, nombre: normalizedName }); // Reemplazar por el mejor
          } else {
            typeService.source_failure='Request';
            duplicateTypeServices.push({ ...typeService }); 
          }
        } else {
          uniqueTypeServices.set(normalizedName, { ...typeService, nombre: normalizedName });
        }
      }    
      return {
        uniqueTypeServices: Array.from(uniqueTypeServices.values()),
        duplicateTypeServices,
      };
    }

    removeDuplicateTypeClients(typeClientArray: TypeClientDto[]) {
      const uniqueTypeClient = new Map<string, TypeClientDto>();
      const duplicateTypeClient: TypeClientDto[] = [];    
      for (const typeClient of typeClientArray) {        
        const normalizedName = typeClient.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") 
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, "");     
        if (uniqueTypeClient.has(normalizedName)) {
          const existingClient = uniqueTypeClient.get(normalizedName)!;                    
          if (this.isBetterFormatted(typeClient.nombre, existingClient.nombre)) {
            duplicateTypeClient.push({ ...existingClient }); 
            uniqueTypeClient.set(normalizedName, { ...typeClient, nombre: normalizedName }); // Reemplazar por el mejor
          } else {
            typeClient.source_failure='Request';
            duplicateTypeClient.push({ ...typeClient }); 
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
        const normalizedName = typeDocument.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") 
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, ""); 
    
        if (uniqueTypeDocument.has(normalizedName)) {
          const existingClient = uniqueTypeDocument.get(normalizedName)!;          
          if (this.isBetterFormatted(typeDocument.nombre, existingClient.nombre)) {
            duplicateTypeDocument.push({ ...existingClient }); // Guardar copia del duplicado
            uniqueTypeDocument.set(normalizedName, { ...typeDocument, nombre: normalizedName }); // Reemplazar por el mejor
          } else {
            typeDocument.source_failure='Request';
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

    removeDuplicateBrands(brandsArray: BrandDto[]) {
      const uniqueBrands = new Map<string, BrandDto>();
      const duplicateBrands: BrandDto[] = [];
    
      for (const brand of brandsArray) {        
        const normalizedName = brand.nombre
          .trim()
          .toLowerCase()
          .replace(/\s+/g, " ") 
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, ""); 
    
        if (uniqueBrands.has(normalizedName)) {
          const existingClient = uniqueBrands.get(normalizedName)!;                    
          if (this.isBetterFormatted(brand.nombre, existingClient.nombre)) {                        
            uniqueBrands.set(normalizedName, { ...brand, nombre: normalizedName}); // Reemplazar por el mejor
          } else {
            brand.source_failure='Request';
            duplicateBrands.push({ ...brand }); 
          }
        } else {
          uniqueBrands.set(normalizedName, { ...brand, nombre: normalizedName });
        }
      }
      return {
        uniqueBrands: Array.from(uniqueBrands.values()),
        duplicateBrands,
      };
    }
    
}


