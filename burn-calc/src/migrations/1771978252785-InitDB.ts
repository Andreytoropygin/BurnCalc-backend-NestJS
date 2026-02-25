import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1771978252785 implements MigrationInterface {
    name = 'InitDB1771978252785'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Создание таблиц
        await queryRunner.query(`CREATE TABLE "Request_statuses" ("id" SERIAL NOT NULL, "name" character varying(20) NOT NULL, CONSTRAINT "UQ_a8b4574cbc763e0a67df131ec38" UNIQUE ("name"), CONSTRAINT "PK_e474e45ef026efd8db9cce20052" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Compound" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "description" text, "is_active" boolean NOT NULL DEFAULT true, "image_file_name" character varying(50), "video_file_name" character varying(50), "formula" character varying(50) NOT NULL, "molar_mass" numeric(10,4) NOT NULL, "c_count" integer NOT NULL, "h_count" integer NOT NULL, "o_count" integer NOT NULL DEFAULT '0', "class" character varying(50) NOT NULL, CONSTRAINT "PK_c4d5f5193932d9c87bacf4b317f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Request_compound" ("request_id" integer NOT NULL, "compound_id" integer NOT NULL, "priority" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_cc37795d2b5fe6e5bb3f0a13cdc" PRIMARY KEY ("request_id", "compound_id"))`);
        await queryRunner.query(`CREATE TABLE "Request" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "status_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "formed_at" TIMESTAMP, "completed_at" TIMESTAMP, "moderator_id" integer, "sample_mass" numeric(10,4), "co2_volume" numeric(10,4), "h2o_volume" numeric(10,4), "calculated_compound_id" integer, CONSTRAINT "PK_23de24dc477765bcc099feae8e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "password" character varying(50) NOT NULL, "role" character varying(20) NOT NULL DEFAULT 'user', CONSTRAINT "UQ_99f220333df04d5f74f6db26c07" UNIQUE ("name"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Request_compound" ADD CONSTRAINT "FK_138bbf23b8f69ec818215e0b95d" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request_compound" ADD CONSTRAINT "FK_55bf289ed4e68dbcaa6b1bd8e12" FOREIGN KEY ("compound_id") REFERENCES "Compound"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request" ADD CONSTRAINT "FK_5b3b221fe5d60481c8ae3829c27" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request" ADD CONSTRAINT "FK_bebb8d4c24331ee9d769f203343" FOREIGN KEY ("status_id") REFERENCES "Request_statuses"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request" ADD CONSTRAINT "FK_f99f1c3f2f3a43173324ed716f3" FOREIGN KEY ("moderator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request" ADD CONSTRAINT "FK_012a3d7e951845504ec65f0ebfb" FOREIGN KEY ("calculated_compound_id") REFERENCES "Compound"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`
            CREATE OR REPLACE FUNCTION check_single_draft_per_user()
            RETURNS TRIGGER AS $$
            DECLARE
                draft_status_id INTEGER;
                draft_count INTEGER;
            BEGIN
                SELECT id INTO draft_status_id FROM "Request_statuses" WHERE name = 'draft';

                IF NEW.status_id = draft_status_id THEN
                    SELECT COUNT(*) INTO draft_count 
                    FROM "Request" 
                    WHERE user_id = NEW.user_id 
                      AND status_id = draft_status_id 
                      AND id != COALESCE(NEW.id, -1);

                    IF draft_count > 0 THEN
                        RAISE EXCEPTION 'У пользователя уже есть активная заявка в статусе черновик.';
                    END IF;
                END IF;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;
        `);
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS trg_enforce_single_draft ON "Request";
            CREATE TRIGGER trg_enforce_single_draft
            BEFORE INSERT OR UPDATE OF status_id ON "Request"
            FOR EACH ROW
            EXECUTE FUNCTION check_single_draft_per_user();
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER IF EXISTS trg_enforce_single_draft ON "Request"`);
        await queryRunner.query(`DROP FUNCTION IF EXISTS check_single_draft_per_user()`);
        await queryRunner.query(`ALTER TABLE "Request" DROP CONSTRAINT "FK_012a3d7e951845504ec65f0ebfb"`);
        await queryRunner.query(`ALTER TABLE "Request" DROP CONSTRAINT "FK_f99f1c3f2f3a43173324ed716f3"`);
        await queryRunner.query(`ALTER TABLE "Request" DROP CONSTRAINT "FK_bebb8d4c24331ee9d769f203343"`);
        await queryRunner.query(`ALTER TABLE "Request" DROP CONSTRAINT "FK_5b3b221fe5d60481c8ae3829c27"`);
        await queryRunner.query(`ALTER TABLE "Request_compound" DROP CONSTRAINT "FK_55bf289ed4e68dbcaa6b1bd8e12"`);
        await queryRunner.query(`ALTER TABLE "Request_compound" DROP CONSTRAINT "FK_138bbf23b8f69ec818215e0b95d"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "Request"`);
        await queryRunner.query(`DROP TABLE "Request_compound"`);
        await queryRunner.query(`DROP TABLE "Compound"`);
        await queryRunner.query(`DROP TABLE "Request_statuses"`);
    }
}