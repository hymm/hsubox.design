---
title: Archetype Fragmentation
date: 2021-05-04
---
![Screenshot of "Shoe Crosses the Road"](/images/shoe-crosses-the-road.png)

My frogger clone, "Shoe Crosses the Road" was having some issues with a big framerate hitch during the first collision between the player and a car.  During subsequent collisions the problem did not happen.

### First Collision
![Gif of Frame Drops](/images/bad-crash-zoomed.gif) 

### Subsequent Collisions
![Gif without Frame Drops](/images/good-crash-zoomed.gif)

Frame stepping the video capture I can see that it's dropping about 8 frames. I expect that this was due to archetype fragmentation. I had coded the Player without worrying about fragmentation too much and the fact that it was happening on a collision event where I knew components were being added and removed.  I could just refactor away this fragmentation, but lets use some of bevy's introspection abilities to take a look under the hood.
## What is Archetype Fragmentation and why is it so bad?

In bevy engine, each unique group of components is termed an archetype.  This is effectively the "type" of an entity.  So an entity with components (A, B, C) would be considered a different archetype from an entity with (A, B, C, D).

When you add or remove a component from an entity this changes the archetype of an entity.  This forces the ecs to create a new type and allocate memory for the new type.  and also remove the entity from the old archetype  and copying it's data to the new archetype.  This might also require repacking the table storage of the old archetypes as table storage is a dense storage.

It's beyond the scope of this article to describe the structure on an ecs in detail.  Consider these for further reading:
### Further Reading
* probably not include this one https://community.amethyst.rs/t/archetypal-vs-grouped-ecs-architectures-my-take/1344/2
* bevy 5.0 new post
* golden PR
* https://skypjack.github.io/2019-03-07-ecs-baf-part-2/
## Looking into the ECS, does it stare back?

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

The collision adds one component.  I know this is the particle marker component.  But unexpectedly there are 9 archetypes added.  This is double what it started with.  What the hell happened?

There are three entities involved in a collision, the car, the player, and the blood particles.  The car is not acted upon in a collision.  So either or both the player and blood are causing the hitch.  Let's investigate the player first.

## Investigating the Player Entity

The player entity is spawned with a marker component.  We can use `bevy_mod_debug_console` to query for the `Player` component like so:

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

We see that a `NextPosition` Component is added in archetype 10 and a `Velocity` component is added in archetype 11.  So lets refactor to add these to the player bundle.


### Refactoring

I didn't add these into the initial player bundle that is used to spawn the `Player`. I wanted to not run systems that used `NextPosition` and `Velocity` when not needed.  So to refactor this I'll need to make sure those systems don't act on the Player when these aren't needed.

I was removing velocity when it's near zero, so the player doesn't move, but will change to always have a velocty.  I'll probably use an early return in the systems when `Velocity` is near zero. 

For `NextPosition` specifies which tile to move to next and systems that use `NextPosition` need to not run when `CurrentPosition` is equal to `NextPosition`.  For this I'll refactor to use an `Option<Position>`.

### Results



## Talking Points
* purposely did a naive implementation
* inserts fragment archetype
* made debug console to help debug these issues
* define what archetype fragmentation is

### Notes
* bevy has a hybrid storage model.  meaning it implements 2 types of storages, tables and sparse sets.  In the ecs world tables are normally called archetypes. but bevy uses archetype to refer to the specific set of components of an entity.

