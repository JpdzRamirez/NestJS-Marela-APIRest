import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './config/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/users/users.module';
import { UtilityModule } from './shared/utility/utility.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { ContractsModule } from './modules/contracts/contracts.module';
import { SchemasService } from './modules/schemas/schemas.service';
import { SchemasModule } from './modules/schemas/schemas.module';
import { TypeClientService } from './modules/type_client/type_client.service';
import { TypeClientController } from './modules/type_client/type_client.controller';
import { TypeClientModule } from './modules/type_client/type_client.module';
import { ClientService } from './modules/clients/clients.service';
import { ClientController } from './modules/clients/clients.controller';
import { ClientModule } from './modules/clients/clients.module';
import { TypeDocumentService } from './modules/type_document/type_document.service';
import { TypeDocumentController } from './modules/type_document/type_document.controller';
import { TypeDocumentModule } from './modules/type_document/type_document.module';
import { WaterMeterService } from './modules/meters/meters.service';
import { WaterMeterController } from './modules/meters/meters.controller';
import { WaterMeterModule } from './modules/meters/meters.module';
import { BrandsService } from './modules/brands/brands.service';
import { BrandsController } from './modules/brands/brands.controller';
import { BrandsModule } from './modules/brands/brands.module';
import { TypeServicesService } from './modules/type_services/type_services.service';
import { TypeServicesController } from './modules/type_services/type_services.controller';
import { TypeServicesModule } from './modules/type_services/type_services.module';
import { SalesRateService } from './modules/sales_rate/sales_rate.service';
import { SalesRateController } from './modules/sales_rate/sales_rate.controller';
import { SalesRateModule } from './modules/sales_rate/sales_rate.module';
import { MunicipalUnitService } from './modules/municipal_unit/municipal_unit.service';
import { MunicipalUnitController } from './modules/municipal_unit/municipal_unit.controller';
import { MunicipalUnitModule } from './modules/municipal_unit/municipal_unit.module';
import { CityServices } from './modules/cities/cities.service';
import { CitiesController } from './modules/cities/cities.controller';
import { CitiesModule } from './modules/cities/cities.module';
import { StatesService } from './modules/states/states.service';
import { StatesController } from './modules/states/states.controller';
import { StatesModule } from './modules/states/states.module';
import { TrailServices } from './modules/trails/trails.service';
import { TrailController } from './modules/trails/trails.controller';
import { TrailModule } from './modules/trails/trails.module';
import { ActivitiesController } from './modules/activities/activities.controller';
import { ActivitiesModule } from './modules/activities/activities.module';
import { ActivityServices } from './modules/activities/activities.service';
import { ProductsActivityService } from './modules/products_activity/products_activity.service';
import { ProductsActivityController } from './modules/products_activity/products_activity.controller';
import { ProductsActivityModule } from './modules/products_activity/products_activity.module';
import { PaymentsActivityService } from './modules/payments_activity/payments_activity.service';
import { PaymentsActivityController } from './modules/payments_activity/payments_activity.controller';
import { PaymentsActivityModule } from './modules/payments_activity/payments_activity.module';
import { InvoiceHeaderService } from './modules/invoice_header/invoice_header.service';
import { InvoiceHeaderController } from './modules/invoice_header/invoice_header.controller';
import { InvoiceHeaderModule } from './modules/invoice_header/invoice_header.module';
import { InvoiceFooterService } from './modules/invoice_footer/invoice_footer.service';
import { InvoiceFooterController } from './modules/invoice_footer/invoice_footer.controller';
import { InvoiceFooterModule } from './modules/invoice_footer/invoice_footer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }), // 🔹 Carga variables de entorno desde `.env`
    DatabaseModule,
    AuthModule,
    UserModule,
    UtilityModule,
    InvoicesModule,
    ContractsModule,
    SchemasModule,
    TypeClientModule,
    ClientModule,
    TypeDocumentModule,
    WaterMeterModule,
    BrandsModule,
    TypeServicesModule,
    SalesRateModule,
    MunicipalUnitModule,
    CitiesModule,
    StatesModule,
    TrailModule,
    ActivitiesModule,
    ProductsActivityModule,
    PaymentsActivityModule,
    InvoiceHeaderModule,
    InvoiceFooterModule,
  ],
  controllers: [AppController, TypeClientController, ClientController, TypeDocumentController, WaterMeterController, BrandsController, TypeServicesController, SalesRateController, MunicipalUnitController, CitiesController, StatesController, TrailController, ActivitiesController, ProductsActivityController, PaymentsActivityController, InvoiceHeaderController, InvoiceFooterController],
  providers: [AppService, SchemasService, TypeClientService, ClientService, TypeDocumentService, WaterMeterService, BrandsService, TypeServicesService, SalesRateService, MunicipalUnitService, CityServices, StatesService, TrailServices, ActivityServices, ProductsActivityService, PaymentsActivityService, InvoiceHeaderService, InvoiceFooterService],
})
export class AppModule {}
