---
title: Archetype Fragmentation
date: 2021-05-04
---
![Screenshot of "Shoe Crosses the Road"](/images/shoe-crosses-the-road.png)

My frogger clone, "Shoe Crosses the Road" was having some issues with a big framerate hitch during the first collision between the player and a car.  During subsequent collisions the problem did not happen.  I suspected this was due to archetype fragmentation as I had naively implemented, where I knew that I was adding components that would fragment the archetypes.

![Gif of Frame Drops](/images/bad-crash-zoomed.gif) ![Gif without Frame Drops](/images/good-crash-zoomed.gif)

Frame stepping the vidoe capture I can see that it's dropping about 8 frames.

## What is an Archetype?

In bevy engine, each unique group of components is termed an archetype.  This is effectively the "type" of an entity.  So an entity with components (A, B, C) would be considered a different archetype from an entity with 

When you add or remove a component from an entity this changes the archetype of an entity.  This forces the ecs to create a new type and allocate memory for the new type.  and also remove the entity from the old archetype (which may require repacking the old archetype) and copying it's data to the new archetype.

## Looking into the ECS, does it stare back? or why i wrote bevy_mod_debug_dump

Bevy exposes several system params that contain information about the ecs. `Archetypes`, `Components`, and `Entities` give access to meta information about the ecs. For example you can write a system as follows to print the counts of the archetypes, components, and entities.

```rust
// information about the ecs is available through the 
// special SystemParam's Archetypes Components and Entities.  
// The following function prints the count of each.
fn print_ecs_counts(
    archetypes: &Archetypes, 
    components: &Components, 
    entities: &Entities
) {
    println!(
        "archetypes: {}, components: {}, entities: {}\n",
        archetypes.len(),
        components.len(),
        entities.len()
    ))
}
```

I wrote `bevy_mod_debug_console` library to have more ready access to this info for debugging.


```bash
# before collision
entities: 263, components: 157, archetypes: 9

# after collision
entities: 263, components: 158, archetypes: 18
```

The collision adds one component.  This is the particle marker component.  But unexpectedly there are 9 archetypes added.  This is double what it started with.  What the hell happened?

Maybe something to do with Player.  Lets see what we can figure out 

```bash
>>> components list --filter Player

[component id] [component name]
97 Events<CollisionEvent<Player, Car>>
98 Events<CollisionEvent<Player, Wall>>
131 Player

>>> archetypes find --componentid 131

archetype ids:
8,

# after collision
>>> archetypes find --componentid 131

archetype ids:
8, 10, 11,
```

We find the id of the Player marker component and find the archetype ids before and after the collision and see there were 2 archetypes added with the Player component.  So what's causing these new archetypes?

```bash
>>> archetypes info --id 10

id: ArchetypeId(9)
table_id: TableId(8)
entities (0):
table_components (18): 114 Transform, 115 GlobalTransform, 116 Draw, 
120 Animations, 121 Animator, 122 Handle<TextureAtlas>, 123 TextureAtlasSprite, 
126 PixelPosition, 128 Layer, 129 SpriteSize, 130 Hurtbox, 131 Player, 
136 CurrentPosition, 137 NextPosition, 145 Visible, 147 RenderPipelines, 
153 MainPass, 155 Handle<Mesh>,
sparse set components (0):
```


lets collect this info into a table to compare more easily


|8  |10  |11 |
|---|---|---|
|Transform|Transform|Transform|
|GlobalTransform|GlobalTransform|GlobalTransform|
|Draw|Draw|Draw|
|Animations|Animations|Animations
|Animator|Animator|Animator
|Handle<TextureAtlas>|Handle<TextureAtlas>|Handle<TextureAtlas>|
|TextureAtlasSprite|TextureAtlasSprite|TextureAtlasSprite|
||||**Velocity**|
|PixelPosition|PixelPosition|PixelPosition|
|Layer|Layer|Layer|
|SpriteSize|SpriteSize|SpriteSize|
|Hurtbox|Hurtbox|Hurtbox|
|Player|Player|Player|
|CurrentPosition|CurrentPosition|CurrentPosition|
||**NextPosition**|**NextPosition**|
|Visible|Visible|Visible|
|RenderPipelines|RenderPipelines|RenderPipelines|
|MainPass|MainPass|MainPass|
|Handle<Mesh>|Handle<Mesh>|Handle<Mesh>|

We see that a NextPosition Component is added in archetype 10 and a Velocity component is added in archetype 11.

## Talking Points
* purposely did a naive implementation
* inserts fragment archetype
* made debug console to help debug these issues
* define what archetype fragmentation is

### Notes
* bevy has a hybrid storage model.  meaning it implements 2 types of storages, tables and sparse sets.  In the ecs world tables are normally called archetypes. but bevy uses archetype to refer to the specific set of components of an entity.

### Further Reading
* probably not include this one https://community.amethyst.rs/t/archetypal-vs-grouped-ecs-architectures-my-take/1344/2
* bevy 5.0 new post
* golden PR
* https://skypjack.github.io/2019-03-07-ecs-baf-part-2/