import { Entity, PrimaryGeneratedColumn, Column} from 'typeorm';
import "reflect-metadata";

@Entity('logger_history')
export class Logger {
    @PrimaryGeneratedColumn("increment")
    id!: number;
    
    @Column({ name: 'status_code',type: 'varchar', nullable: false })
    status_code!: string;

    @Column({ name: 'error_type',type: 'varchar', unique: true, nullable: false })
    error_type!: string;

    @Column({ name: 'method',type: 'varchar', nullable: false })
    method!: string;

    @Column({ name: 'url',type: 'varchar', length: 100, nullable: false })
    url!: string;

    @Column({ name: 'address_ipv4',type: 'varchar', nullable: false })
    address_ipv4!: string;

    @Column({ name: 'device_model',type: 'varchar', nullable: false })
    device_model!: string;

    @Column({ name: 'operating_system',type: 'varchar', nullable: false })
    operating_system!: string;

    @Column({ name: 'android_version',type: 'varchar', nullable: false })
    android_version!: string;

    @Column({ name: 'app_version',type: 'varchar', nullable: false })
    app_version!: string;

    @Column({ name: 'build_number',type: 'varchar', nullable: false })
    build_number!: string;

    @Column({ name: 'flutter_version',type: 'varchar', nullable: false })
    flutter_version!: string;

    @Column({ name: 'status_message',type: 'varchar', length: 100, nullable: false })
    status_message!: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

}