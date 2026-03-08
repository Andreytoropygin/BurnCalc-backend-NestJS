import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1772993213344 implements MigrationInterface {
    name = 'InitDB1772993213344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Combustion" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "image_file_name" character varying(50), "video_file_name" character varying(50), "formula" character varying(50) NOT NULL, "specific_h2o_volume" numeric(10,4) NOT NULL, "specific_co2_volume" numeric(10,4) NOT NULL, "class" character varying(50) NOT NULL, CONSTRAINT "PK_ee1c15325aa22b109f6ce811816" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Request_combustion" ("request_id" integer NOT NULL, "combustion_id" integer NOT NULL, "comment" character varying, "amount" numeric(10,4), CONSTRAINT "PK_66840b12bde58f2cf810c7d5f9a" PRIMARY KEY ("request_id", "combustion_id"))`);
        await queryRunner.query(`CREATE TABLE "Request" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "formed_at" TIMESTAMP, "completed_at" TIMESTAMP, "moderator_id" integer, "sample_description" character varying, "co2_volume" numeric(10,4), "h2o_volume" numeric(10,4), CONSTRAINT "PK_23de24dc477765bcc099feae8e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "password" character varying(50) NOT NULL, "is_moderator" boolean NOT NULL, CONSTRAINT "UQ_99f220333df04d5f74f6db26c07" UNIQUE ("name"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Request_combustion" ADD CONSTRAINT "FK_51654d569adda26540a45709cbd" FOREIGN KEY ("request_id") REFERENCES "Request"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request_combustion" ADD CONSTRAINT "FK_1972c7c3675b4fd16ca3d963610" FOREIGN KEY ("combustion_id") REFERENCES "Combustion"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request" ADD CONSTRAINT "FK_5b3b221fe5d60481c8ae3829c27" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Request" ADD CONSTRAINT "FK_f99f1c3f2f3a43173324ed716f3" FOREIGN KEY ("moderator_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Request" DROP CONSTRAINT "FK_f99f1c3f2f3a43173324ed716f3"`);
        await queryRunner.query(`ALTER TABLE "Request" DROP CONSTRAINT "FK_5b3b221fe5d60481c8ae3829c27"`);
        await queryRunner.query(`ALTER TABLE "Request_combustion" DROP CONSTRAINT "FK_1972c7c3675b4fd16ca3d963610"`);
        await queryRunner.query(`ALTER TABLE "Request_combustion" DROP CONSTRAINT "FK_51654d569adda26540a45709cbd"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "Request"`);
        await queryRunner.query(`DROP TABLE "Request_combustion"`);
        await queryRunner.query(`DROP TABLE "Combustion"`);
    }

}
