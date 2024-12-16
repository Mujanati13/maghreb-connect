--
-- Add field img_path to client
--
ALTER TABLE `client` ADD COLUMN `img_path` varchar(100) NULL;
--
-- Alter field adresse on client
--
ALTER TABLE `client` MODIFY `adresse` varchar(255) NULL;
--
-- Alter field cp on client
--
ALTER TABLE `client` MODIFY `cp` varchar(10) NULL;
--
-- Alter field password on client
--
ALTER TABLE `client` MODIFY `password` varchar(255) NULL;
--
-- Alter field pays on client
--
ALTER TABLE `client` MODIFY `pays` varchar(100) NULL;
--
-- Alter field raison_sociale on client
--
ALTER TABLE `client` MODIFY `raison_sociale` varchar(255) NULL;
--
-- Alter field siret on client
--
ALTER TABLE `client` MODIFY `siret` varchar(14) NULL;
--
-- Alter field ville on client
--
ALTER TABLE `client` MODIFY `ville` varchar(100) NULL;
--
-- Alter field Doc_URL on doc_clt
--
-- (no-op)
