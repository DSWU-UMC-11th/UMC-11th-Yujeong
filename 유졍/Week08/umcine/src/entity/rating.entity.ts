import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Member } from "./member.entity";

@Entity({ name: "rating" })
export class Rating {
  @PrimaryGeneratedColumn({ name: "rating_id", type: "bigint" })
  ratingId: number;

  @Column({ name: "movie_id", type: "bigint" }) // 👈 type: "bigint" 명시
  movieId: number;

  @Column({ type: "tinyint" }) // 👈 type: "tinyint" 명시
  score: number;

  @Column({ type: "text", nullable: true }) // 👈 type: "text" 명시
  comment: string | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;

  @ManyToOne(() => Member, (member) => member.ratings)
  @JoinColumn({ name: "member_id" })
  member: Member;
}
