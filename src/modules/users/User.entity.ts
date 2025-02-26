import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../roles/role.entity';
import { Schemas } from '../schemas/schema.entity';

@Entity('users') // Nombre de la tabla en Supabase
export class User {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'uuid_authsupa',type:'uuid',nullable:true, unique: true })
    uuid_authsupa?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({ name: 'schema_id', type: 'int4', nullable: true })
    schema_id?: number;

    @Column({ nullable: true,type: 'varchar', unique: true, length: 50 })
    document?: string; // No puede ser null y debe ser único

    @Column({ nullable: false,type: 'varchar', unique: true, length: 50 })
    email!: string; // No puede ser null y debe ser único

    @Column({ nullable: true,type: 'varchar' })
    password?: string; // No puede ser null

    @Column({ nullable: false,type: 'varchar', length: 50 })
    name!: string; // No puede ser null

    @Column({ nullable: true,type: 'varchar', length: 50 })
    lastname?: string;

    @Column({ nullable: false,type: 'varchar', length: 50 })
    mobile!: string; // No puede ser null

    @Column({ nullable: true,type: 'varchar', length: 50 })
    phone?: string;

    @Column({ nullable: true,type: 'varchar', length: 50 })
    address?: string;

    @Column({ nullable: true, unique: true, type: 'varchar', length: 50 })
    auth_code?: string;

    @Column({ nullable: true, unique: true, type: 'varchar', length: 50})
    imei_id?: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); // Se genera automáticamente

    @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at?: string;

    @ManyToOne(() => Role, { nullable: true, eager: true }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'role_id' })
    roles?: Role | null;

    @ManyToOne(() => Schemas, { nullable: true, eager: true }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'schema_id' })
    schemas?: Schemas | null;
}
