import { MigrationInterface, QueryRunner } from "typeorm";

export class InitDB1773351497502 implements MigrationInterface {
    name = 'InitDB1773351497502'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Compounds" ("id" SERIAL NOT NULL, "title" character varying(50) NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "image_url" character varying(100), "video_url" character varying(100), "formula" character varying(50) NOT NULL, "description" character varying(150) NOT NULL, "specific_h2o_volume" numeric(10,4) NOT NULL, "specific_co2_volume" numeric(10,4) NOT NULL, "class" character varying(50) NOT NULL, CONSTRAINT "UQ_115427cd41466880a5934527025" UNIQUE ("title"), CONSTRAINT "UQ_b46b26dae605b0cac4474ecca3f" UNIQUE ("formula"), CONSTRAINT "PK_6d49e31a789516690c0410cd84b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Compound_combustions" ("id" SERIAL NOT NULL, "combustion_id" bigint NOT NULL, "compound_id" bigint NOT NULL, "comment" text, "amount" numeric(10,4), CONSTRAINT "uq_compound_combustion" UNIQUE ("combustion_id", "compound_id"), CONSTRAINT "PK_8efab30bcf05b04ca10565dc289" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Combustions" ("id" SERIAL NOT NULL, "technician_id" bigint NOT NULL, "status" character varying(20) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "formed_at" TIMESTAMP, "completed_at" TIMESTAMP, "expert_id" bigint, "sample_description" text, "co2_volume" numeric(10,4), "h2o_volume" numeric(10,4), CONSTRAINT "PK_ac02fed4cfde0fc31c8324e77d2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Users" ("id" SERIAL NOT NULL, "name" character varying(50) NOT NULL, "password" character varying(50) NOT NULL, "is_expert" boolean NOT NULL, CONSTRAINT "UQ_64cb8990239bed919f82154b320" UNIQUE ("name"), CONSTRAINT "PK_16d4f7d636df336db11d87413e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Compound_combustions" ADD CONSTRAINT "FK_893affb1790323f159ddd82e36f" FOREIGN KEY ("combustion_id") REFERENCES "Combustions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Compound_combustions" ADD CONSTRAINT "FK_1bdee13578585950a417fef5f0f" FOREIGN KEY ("compound_id") REFERENCES "Compounds"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Combustions" ADD CONSTRAINT "FK_ceb433ab498ab9c93dd2c13de39" FOREIGN KEY ("technician_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Combustions" ADD CONSTRAINT "FK_c114b71d83a28ca126dbc8a4574" FOREIGN KEY ("expert_id") REFERENCES "Users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Combustions" DROP CONSTRAINT "FK_c114b71d83a28ca126dbc8a4574"`);
        await queryRunner.query(`ALTER TABLE "Combustions" DROP CONSTRAINT "FK_ceb433ab498ab9c93dd2c13de39"`);
        await queryRunner.query(`ALTER TABLE "Compound_combustions" DROP CONSTRAINT "FK_1bdee13578585950a417fef5f0f"`);
        await queryRunner.query(`ALTER TABLE "Compound_combustions" DROP CONSTRAINT "FK_893affb1790323f159ddd82e36f"`);
        await queryRunner.query(`DROP TABLE "Users"`);
        await queryRunner.query(`DROP TABLE "Combustions"`);
        await queryRunner.query(`DROP TABLE "Compound_combustions"`);
        await queryRunner.query(`DROP TABLE "Compounds"`);
    }

}
