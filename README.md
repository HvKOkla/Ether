Ether Language (v0.3)

Ether est un langage de programmation bas niveau (style Assembleur) exécuté dans sa propre **Machine Virtuelle (VM)** en JavaScript. 

Le projet est conçu pour évoluer vers un moteur ultra performant réécrit en **Rust** (avec support WebAssembly).

---

##  Nouveautés de la v0.3

* **Gestion du contrôle de flux :** Ajout des étiquettes (`label:`) et des sauts conditionnels (`JMP`, `CMP`, `JE`, `JNE`) pour créer des boucles et des structures conditionnelles.
* **Registres officiels Ether :** Abandon de la syntaxe x86 pour 4 registres dédiés :
  * `ACC` (Accumulateur) : Stocke les résultats principaux.
  * `VAL` (Valeur) : Registre secondaire pour les calculs à deux opérandes.
  * `CNT` (Compteur) : Dédié aux itérations et aux boucles.
  * `TMP` (Temporaire) : Registre de travail rapide.
* **Architecture Modulaire :** Séparation claire entre l'Analyseur/Compilateur (`compiler.js`) et le Moteur d'Exécution (`vm.js`).

---

## Jeu d'Instructions (Opcodes)

| Instruction | Exemple | Description |
| :--- | :--- | :--- |
| `MOV` | `MOV ACC, 50` | Copie une valeur ou un registre dans une destination. |
| `ADD` / `SUB` | `ADD ACC, CNT` | Additionne ou soustrait des valeurs. |
| `MUL` | `MUL ACC, 2` | Multiplie le registre spécifié. |
| `INC` / `DEC` | `INC CNT` | Incrémente ou décrémente de 1. |
| `STORE` | `STORE [0], ACC` | Écrit la valeur du registre dans l'adresse RAM indiquée. |
| `LOAD` | `LOAD VAL, [0]` | Lit la valeur de la RAM et la stocke dans un registre. |
| `CMP` | `CMP CNT, 5` | Compare deux valeurs et met à jour le drapeau d'état (`flagEqual`). |
| `JMP` | `JMP mon_label` | Saut inconditionnel vers un label. |
| `JE` / `JNE` | `JNE boucle` | Saut si Égal (`JE`) ou si Différent (`JNE`). |

---

## 📜 Exemple de code `.eth`

Voici une boucle de calcul qui additionne 20 à `ACC` jusqu'à ce que `CNT` atteigne 5, puis sauvegarde le résultat en RAM :


MOV CNT, 0        ; Initialise le compteur
MOV ACC, 0        ; Initialise l'accumulateur

boucle:
ADD ACC, 20       ; Ajoute 20 à ACC
INC CNT           ; Incremente le compteur

CMP CNT, 5        ; Vérifie si CNT == 5
JNE boucle        ; Recommence si CNT != 5

STORE [0], ACC    ; Sauvegarde le résultat (100) en RAM à l'adresse 0
