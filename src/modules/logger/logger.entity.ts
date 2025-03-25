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

    @Column({ name: 'method',type: 'int', nullable: false })
    method!: number;

    @Column({ name: 'url',type: 'varchar', length: 100, nullable: false })
    url!: string;

    @Column({ name: 'status_message',type: 'varchar', length: 100, nullable: false })
    status_message!: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at!: Date;

    @Column({ name: 'uploaded_by_authsupa', type:'uuid', unique: false, nullable: true })
    uploaded_by_authsupa?: string;

}