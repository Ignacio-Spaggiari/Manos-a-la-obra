# Manos a la OBRA

## Concepto: "Está mal, pero no tan mal"

En este juego controlás a un personaje que debe **empujar** a otras personas para salvarlas de objetos que caen desde arriba. A primera vista, empujar a alguien está mal — pero en este contexto no lo está tanto, porque ese empujón es lo único que puede sacarlas a tiempo de la zona de peligro. La acción que parece incorrecta es, en realidad, la que evita un daño mayor.

## Objetivo del juego

Salvar a la mayor cantidad de personas posible a lo largo de 3 niveles, evitando perder todas las vidas antes de completar cada uno.

## Controles

- **Flechas izquierda / derecha:** mover al personaje.
- **Flecha arriba:** saltar.
- **Flecha abajo:** bajar a través de una plataforma (mientras estás parado sobre ella).

## Mecánica principal

Los NPCs van apareciendo de a uno en distintos puntos del escenario. Antes de que caiga un objeto sobre alguno de ellos, aparece una **señal de advertencia** en el piso. El jugador tiene unos segundos para llegar y tocar al NPC, que sale disparado hacia un costado (empujado fuera de peligro) sumando puntos. Si no llega a tiempo, el objeto lo golpea y el jugador pierde una vida.

## Niveles

**Nivel 1 — Introducción:** el jugador se mueve por un escenario simple, sin plataformas, aprendiendo la mecánica principal de empujar NPCs a tiempo.

**Nivel 2 — Plataformas:** se agregan dos capas de plataformas elevadas (atravesables desde abajo, se puede bajar apretando la flecha abajo), obligando al jugador a moverse y saltar más para alcanzar a los NPCs que aparecen en altura. El ritmo de aparición de advertencias y caída de objetos es más rápido que en el Nivel 1.

**Nivel 3 — Nivel final:** las plataformas forman una estructura en X con más altura. Aparece un enemigo que persigue al jugador desde el inicio y le resta una vida al tocarlo. Al salvar al 5to NPC, se suma un segundo enemigo que persigue al NPC activo — si se queda encima del NPC varios segundos sin que el jugador llegue a rescatarlo, lo mata. Este nivel arranca con una vida extra respecto a los anteriores, por su mayor dificultad.

## Puntos y vidas

- Salvar a un NPC (empujarlo a tiempo): **+10 puntos**.
- El puntaje y las vidas se mantienen entre niveles (excepto al reintentar tras un Game Over, que reinicia ambos).
- Perder todas las vidas manda a la pantalla de Game Over, con la opción de reintentar desde el nivel en el que se perdió, o volver al menú principal.
- Completar el Nivel 3 lleva a la pantalla de victoria.

## Tecnologías utilizadas

- [Phaser 3](https://phaser.io/) (motor de juego)
- HTML, CSS y JavaScript
- Assets de [Kenney](https://kenney.nl/) (CC0)
