import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Role } from '../roles/Role.entity';

@Entity('users') // Nombre de la tabla en Supabase
export class User {
    @PrimaryGeneratedColumn("increment") // ID autoincremental
    id!: number;

    @Column({ name: 'uuid_authsupa',type:'uuid',nullable:true, unique: true })
    uuid_authsupa?: string | null;  // Puede ser opcional si Supabase lo genera

    @Column({ name: 'schema_id', nullable: true })
    schema_id?: number;

    @Column({ nullable: true, unique: true })
    document?: string; // No puede ser null y debe ser único

    @Column({ nullable: false, unique: true })
    email!: string; // No puede ser null y debe ser único

    @Column({ nullable: true })
    password?: string; // No puede ser null

    @Column({ nullable: false })
    name!: string; // No puede ser null

    @Column({ nullable: true })
    lastname?: string;

    @Column({ nullable: false })
    mobile!: string; // No puede ser null

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    address?: string;

    @Column({ nullable: true, unique: true })
    auth_code?: string;

    @Column({ nullable: true, unique: true })
    imei_id?: string;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date = new Date(); // Se genera automáticamente

    @Column({ nullable: true, type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at?: string;

    @ManyToOne(() => Role, { nullable: true, eager: true }) // Cargar el rol automáticamente
    @JoinColumn({ name: 'role_id' })
    roles?: Role | null;
}
