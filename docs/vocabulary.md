# Référence des mots utilisés dans le projet

---

## Général

**FOLDER** : Cela représente un dossier informatique (répertoire de stockage)

**FILE** : Cela représente un dossier client

**FILE_ITEM** : Cela représente un dossier client avec des infos restreintes (stockées dans la DB)

**QUOTATION** : Devis d'un client

**WORKSHEET** : Document d'informations complémentaires au devis

## Produits

- SOL &#8594; Isolation Sol
- COMBLE &#8594; Isolation Comble
- PAC RR &#8594; Pompe à Chaleur Air Air
- PAC RO &#8594; Pompe à Chaleur Air Eau
- CET &#8594; Chauffe Eau Thermodynamique
- PG &#8594; Poele à Granulé

## Housing (Logement)

- **area** &#8594; superficie
- **isRentedHouse** &#8594; estUneLocation
- **buildingNature** &#8594; Nature du batiment (ig : Nouvelle résidence principale, Location, Résidence secondaire...)

## Quotation (Devis)

### PAC RO

**cascadeSystem** &#8594; Installation en cascade (Quand la superficie est trop grande et qu'il y a besoin de 2 PAC)

# V1 &#8594; V2

## Housing (Logement)

- localType &#8594; type
- superficie &#8594; area

# (Scale) Barème

- primeCEE &#8594; ceeBonus
- palierRevenu &#8594; stages
