# Interactable System Documentation

## Overview

The interactable system provides a **configuration-driven approach** to managing interactive 3D objects in the intro scene. Instead of writing duplicate code for each interactive object, you define them in a configuration array.

## Benefits

- **Scalable**: Easily manage 10+ interactables without code duplication
- **Flexible**: Supports both GLB animations and procedural animations
- **Type-safe**: Full TypeScript support with interfaces
- **Maintainable**: Centralized configuration makes updates easy
- **Performant**: Efficient animation system with proper cleanup

## Quick Start

### 1. Add a new interactable to the config

Edit `webapp/config/introInteractables.ts`:

```typescript
import { Model as MyCoolModel } from '@/generated_components/my_cool_model'

export function createIntroInteractables(onPlay, onTutorial) {
  return [
    // ... existing interactables ...

    {
      id: 'my_cool_object',
      modelComponent: MyCoolModel,
      position: [-7, 1.5, 10],
      radius: 0.2,
      onClick: () => console.log('Clicked!'),
      animationType: 'hover_bobble',
    },
  ]
}
```

That's it! The object will automatically render with hover animations and click handling.

## Animation Types

### 1. `hover` - Float up on hover

```typescript
{
  animationType: 'hover',
  animationConfig: {
    hoverHeight: 0.15,  // How high to float
    hoverSpeed: 0.1,    // Smoothing speed
  }
}
```

### 2. `bobble` - Gentle sinusoidal motion

```typescript
{
  animationType: 'bobble',
  animationConfig: {
    bobbleAmplitude: 0.05,  // Bobble height
    bobbleFrequency: 3,     // Bobble speed (Hz)
  }
}
```

### 3. `hover_bobble` - Combined hover + bobble

```typescript
{
  animationType: 'hover_bobble',
  animationConfig: {
    hoverHeight: 0.15,
    hoverSpeed: 0.1,
    bobbleAmplitude: 0.05,
    bobbleFrequency: 3,
  }
}
```

This is the default for most interactive objects (e.g., headset, pizza).

### 4. `spin` - Continuous rotation

```typescript
{
  animationType: 'spin',
  animationConfig: {
    spinSpeed: 1,           // Rotation speed (rad/s)
    spinAxis: 'y',          // 'x', 'y', or 'z'
  }
}
```

**Use case:** Rotating display objects like taxis, coins, etc.

### 5. `glb` - Play GLB animation clips

```typescript
{
  animationType: 'glb',
  animationConfig: {
    clipName: 'DoorOpen',   // Animation clip name (optional)
    playOnHover: true,      // Play on hover instead of loop
    loop: false,            // Loop the animation
    timeScale: 1,           // Animation speed multiplier
  }
}
```

**Use cases:**
- Door opening on hover
- Neon sign flickering
- Character animations
- Mechanical movements

## Complete Configuration Reference

```typescript
interface InteractableConfig {
  // Required
  id: string                          // Unique identifier
  modelComponent: React.ComponentType // Generated GLB component
  position: [number, number, number]  // Sphere position
  radius: number                      // Sphere radius
  animationType: AnimationType        // See animation types above

  // Optional
  modelProps?: Record<string, any>    // Props for model component
  onClick?: () => void                // Click handler
  onHoverStart?: () => void           // Hover start callback
  onHoverEnd?: () => void             // Hover end callback
  animationConfig?: { ... }           // See animation configs above
  label?: string                      // Text label
  labelPosition?: [x, y, z]           // Label position
  visible?: boolean                   // Show/hide (default: true)
}
```

## Real-World Examples

### Example 1: Door with Open Animation

```typescript
{
  id: 'shop_door',
  modelComponent: ShopDoorModel,
  position: [-8, 1.5, 9],
  radius: 0.3,
  onClick: () => {
    // Navigate to shop
    router.push('/shop')
  },
  animationType: 'glb',
  animationConfig: {
    clipName: 'DoorOpen',
    playOnHover: true,
    loop: false,
  },
  label: 'Enter Shop',
  labelPosition: [-8, 1.2, 9.3],
}
```

### Example 2: Rotating Collectible

```typescript
{
  id: 'coin_display',
  modelComponent: CoinModel,
  position: [-6.5, 1.8, 10.5],
  radius: 0.15,
  onClick: () => {
    playSound('coin_pickup')
    addCoins(100)
  },
  animationType: 'spin',
  animationConfig: {
    spinSpeed: 2,
    spinAxis: 'y',
  },
}
```

### Example 3: Character with Idle Animation

```typescript
{
  id: 'npc_vendor',
  modelComponent: VendorModel,
  position: [-7.5, 1.2, 9.8],
  radius: 0.4,
  onClick: () => {
    openDialogue('vendor')
  },
  animationType: 'glb',
  animationConfig: {
    clipName: 'Idle',
    loop: true,
  },
  label: 'Talk to Vendor',
  labelPosition: [-7.5, 2.2, 9.8],
}
```

### Example 4: Hidden Easter Egg

```typescript
{
  id: 'secret_button',
  modelComponent: SecretButtonModel,
  position: [-9, 0.5, 8],
  radius: 0.1,
  onClick: () => {
    unlockSecretLevel()
  },
  animationType: 'none',
  visible: hasDiscoveredSecret, // Conditional visibility
}
```

## Best Practices

### Positioning and Radius

1. **Use small radii** (0.1-0.4) for precise interactions
2. **Test with touch devices** - larger radii (0.2-0.3) work better on mobile
3. **Position slightly above ground** - Y = 1.0-2.0 for eye-level objects

### Animation Selection

- **Hover/Bobble**: UI elements, buttons, pickups
- **Spin**: Collectibles, power-ups, rotating displays
- **GLB**: Doors, characters, mechanical objects

### Performance Tips

1. **Limit GLB animations** to 3-5 simultaneous clips
2. **Use `visible: false`** to completely remove objects from rendering
3. **Avoid nested groups** in model components
4. **Use low-poly models** for interactables (< 5k triangles)

### Callbacks

Use callbacks for side effects:

```typescript
{
  onClick: () => {
    playSound('click')
    trackEvent('interactable_click', { id: 'my_object' })
    performAction()
  },
  onHoverStart: () => {
    playSound('hover')
  },
  onHoverEnd: () => {
    stopSound('hover')
  }
}
```

## GLB Animation Setup

### 1. Export from Blender with animations

- Create animation clips in Blender (Timeline → Animate)
- Name your clips (e.g., "Open", "Close", "Idle")
- Export as GLB with "Animation" checkbox enabled

### 2. Generate TypeScript component

```bash
npx gltfjsx public/models/my_model.glb -o generated_components/MyModelGenerated.tsx -t
```

### 3. Verify animation clips

```typescript
import { Model } from '@/generated_components/MyModelGenerated'

// In your config:
{
  modelComponent: Model,
  animationType: 'glb',
  animationConfig: {
    clipName: 'Open', // Match Blender clip name exactly
  }
}
```

### Debugging GLB animations

If animations don't play:

1. Check browser console for warnings about missing clips
2. Verify clip names match Blender exactly (case-sensitive)
3. Ensure GLB was exported with animations enabled
4. Test in Blender first (File → Export → glTF 2.0 → Check "Animation")

## Troubleshooting

### Object not appearing

- Check `position` is within camera view
- Verify `visible !== false`
- Ensure model component is imported correctly

### Hover not working

- Check `radius` is large enough
- Verify `isPointerDown` isn't stuck (drag vs click)
- Test with `onClick={() => console.log('clicked')}`

### Animation jittery

- Reduce `hoverSpeed` or `bobbleFrequency`
- Check model doesn't have conflicting animations
- Verify no multiple animation systems on same object

### Cursor not changing

- Check browser dev tools for JavaScript errors
- Verify `onPointerEnter`/`onPointerLeave` are firing
- Test with other objects to isolate issue

## File Structure

```
webapp/
├── lib/
│   └── interactableSystem.ts       # Core system logic
├── components/
│   ├── Interactable.tsx            # Single interactable renderer
│   └── InteractableManager.tsx     # Manager component
├── config/
│   └── introInteractables.ts       # Interactable definitions
└── generated_components/
    └── *.tsx                        # Auto-generated GLB components
```

## Migration Guide

### Before (Old approach)

```typescript
// 200 lines of code per interactable!
function InteractiveHeadset({ hovered }) {
  const groupRef = useRef<THREE.Group>(null)
  const baseHeight = useRef(0)

  useFrame((state) => {
    if (groupRef.current) {
      if (hovered) {
        baseHeight.current += (0.15 - baseHeight.current) * 0.1
        const bobble = Math.sin(state.clock.elapsedTime * 3) * 0.05
        groupRef.current.position.y = baseHeight.current + bobble
      } else {
        baseHeight.current *= 0.9
        groupRef.current.position.y = baseHeight.current
      }
    }
  })

  return <group ref={groupRef}><TheHeadset /></group>
}

function HeadsetInteractionSphere({ onClick, setHovered, isPointerDown }) {
  // ... 40 more lines ...
}
```

### After (New approach)

```typescript
// 10 lines in config file!
{
  id: 'headset_play',
  modelComponent: TheHeadset,
  position: [-7.2, 1.48, 10.7],
  radius: 0.15,
  onClick: onPlay,
  animationType: 'hover_bobble',
}
```

**Result**: ~90% less code, infinitely scalable.

## Future Enhancements

Potential additions to the system:

- Sound integration (play sound on hover/click)
- Particle effects on interaction
- Multi-state animations (idle → hover → click)
- Animation sequencing/chaining
- Conditional rendering based on game state
- Accessibility improvements (ARIA labels, keyboard navigation)
