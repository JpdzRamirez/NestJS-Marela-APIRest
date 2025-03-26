import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InvoiceRepository } from './invoices.repository';
import { Invoice } from './invoice.entity';
import { InvoiceDto,GetDateRangeInvoicesDto } from './dto/invoice.dto';
import { AuthRequest } from '../../types';
import { UtilityService } from '../../shared/utility/utility.service';

@Injectable()
export class InvoiceServices {

  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly utilityService: UtilityService     
  ) {}

  /** ✅ Obtener todas las facturas*/
  async getAllInvoices(AuthRequest: AuthRequest): Promise<{ 
        message: String,
        status:boolean
        invoices:Invoice[]
      }>  {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    const result = await this.invoiceRepository.getAllInvoices(user.schemas.name, user.uuid_authsupa);
    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          invoices: result.invoices
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result;
  }
  /** ✅ Obtener facturas dentro rangos de fecha */
  async getDateRangeInvoices(AuthRequest: AuthRequest,dateRange:GetDateRangeInvoicesDto): Promise<{ 
      message: String,
      status:boolean,
      invoices:Invoice[]
    }> {
    const user = AuthRequest.user;
    if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa ) {
      throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
    }

    const result = await this.invoiceRepository.getDateRangeInvoices(user.schemas.name,dateRange,user.uuid_authsupa);
        
    if (!result.status) {
      throw new HttpException(
        {
          message: result.message,
          status: result.status,
          invoices: result.invoices
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    
    return result;
  }

    async submitAllInvoices(AuthRequest: AuthRequest, invoicesArray: InvoiceDto[]): Promise<{ 
        message: string;
        status: boolean;
        inserted: { 
          id: number; 
          id_factura: string;
          fecha_lectura: Date; 
        }[];
        duplicated: InvoiceDto[];
        existing: InvoiceDto[];   
    }>{
        const user = AuthRequest.user;
        if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
          throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
        }
        const uuidAuthsupa: string = user.uuid_authsupa;
        // Mapear todos los DTOs a entidades
        const newInvoicesArray = this.utilityService.mapDtoInvoicesToEntityAndRemoveDuplicate(invoicesArray, uuidAuthsupa)
        
        // Enviar los facturas al repositorio para inserción en la BD
        const result= await this.invoiceRepository.submitAllInvoices(user.schemas.name, newInvoicesArray);  
  
        if (!result.status) {
          throw new HttpException(
            {
              message: result.message,
              status: result.status,
              inserted: result.inserted,
              duplicated: result.duplicated,
              existing: result.existing
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
        
        return result; 
    }

     /** ✅ Sincronizar las facturas*/
      async syncInvoices(AuthRequest: AuthRequest, invoicesArray: InvoiceDto[]): Promise<{ 
          message: String,
          status: Boolean,
          syncronized: InvoiceDto[],
          duplicated: InvoiceDto[] | null   
      }>{
          const user = AuthRequest.user;
          if (!user || !user.schemas || !user.schemas.name || !user.uuid_authsupa  ) {
            throw new HttpException('Usuario sin acueducto', HttpStatus.NOT_FOUND);
          }
          const uuidAuthsupa: string = user.uuid_authsupa;
      
          const invoicesArrayFiltred = this.utilityService.removeDuplicateInvoices(invoicesArray);
      
          // Enviar los clientes al repositorio para inserción en la BD
          const result= await this.invoiceRepository.syncInvoices(user.schemas.name, uuidAuthsupa,invoicesArrayFiltred);
    
          if (!result.status) {
            throw new HttpException(
              {
                message: result.message,
                status: result.status,
                syncronized: result.syncronized,
                duplicated: result.duplicated
              },
              HttpStatus.INTERNAL_SERVER_ERROR
            );
          }
          
          return result; 
      
      }
}
