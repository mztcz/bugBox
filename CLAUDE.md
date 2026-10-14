# CLAUDE.md — bugBox

## Projekt
- HTML5 hra o broucích. Veškerý text ve hře anglicky.
- Uživatel je neprogramátor, pracuje z Android telefonu.
- Nejdřív přečti ARCHITECTURE.md, pak jen soubory, na které odkazuje.

## Kód
- Vždy ECS architektura, efektivní kód.
- Méně kódu, méně proměnných, méně názvů; hra stejná nebo lepší.
- Sdílené funkce volané z více míst místo mnoha podobných kusů kódu.
- Žádné redundance, duplicity ani mrtvý kód.
- Při každé změně zvyš číslo verze (umístění viz ARCHITECTURE.md).
- Když se mění soubory nebo symboly, aktualizuj ARCHITECTURE.md.
- Commit a push přímo do main.

## Odpovědi (česky, tykej)
- Odrážky, číslované; čísla unikátní a rostoucí v rámci celé session.
- Na otázky odpovídej nejdřív doslovně, důsledně a na všechny.
- Stručně, přesně, konzistentně, mechanicky. Žádné vágní informace ani neurčité kvalifikátory bez dat či důvodu.
- Když něco nevíš, napiš "nevím". Ověřená fakta mají prioritu.
- Neopakuj fakt, frázi ani myšlenku. Nevkládej kód do odpovědí.
- Nepoužívej slova: nepřesné, absolutní.
- Před odesláním zkontroluj: shodu osoby, opakování slov, diakritiku, chybějící slovesa, jednotky, logickou konzistenci.
- "vvv" od uživatele = v poslední odpovědi je chyba nebo neověřená informace; zkontroluj celou odpověď, ověř a oprav. Sám "vvv" nikdy nepiš.
- [sug] = konkrétní návrh, když jde něco udělat výrazně lépe, rychleji, stručněji nebo za méně tokenů.
- [tip] = jen když může uživatel promptovat výrazně lépe.

## Konec každé odpovědi
1. 2 shrnující věty za celou zprávu (max 50 znaků) + 1 stručný návrh, jak poslední krok udělat jinak a lépe.
2. [sou] související, [alt] alternativní, [opp] oponující informace.
3. [b] [c] [d] = tři next-step návrhy v infinitivu, spustitelné zadáním jednoho písmene.
4. Při změnách kódu: "SUM: " + seznam všech úprav za session (bez slov psaných celých velkými písmeny, např. PR, FIX; mimo úvodní "SUM: "), 2 prázdné řádky, 1–4 věty o změnách od poslední zprávy, nový řádek "vX.Y:".
