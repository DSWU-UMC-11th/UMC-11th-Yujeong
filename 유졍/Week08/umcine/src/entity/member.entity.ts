import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Rating } from "./rating.entity";

@Entity({ name: "member" })
export class Member {
  @PrimaryGeneratedColumn({ name: "member_id" })
  memberId: number;

  @Column({ type: "varchar", unique: true, length: 254 }) // 👈 type 명시
  email: string;

  @Column({ type: "varchar", length: 60 }) // 👈 type 명시
  password: string;

  @Column({ type: "varchar", unique: true, length: 50 }) // 👈 type 명시
  nickname: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @OneToMany(() => Rating, (rating) => rating.member)
  ratings: Rating[];
}
