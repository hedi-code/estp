-- Add fct_payee and fct_envoyee columns to commande2s table
-- This brings BC2 in line with BC1 functionality

ALTER TABLE commande2s
ADD COLUMN fct_payee tinyint(1) DEFAULT '0',
ADD COLUMN fct_envoyee tinyint(1) DEFAULT '0';