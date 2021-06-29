import { Execution, Natives, RuntimeObject, RuntimeValue } from '../interpreter/runtimeModel'

const game: Natives = {
  game: {
    *addVisual(self: RuntimeObject, visual: RuntimeObject): Execution<void> {
      visual.assertIsNotNull()
      if (!visual.module.lookupMethod('position', 0)) throw new TypeError('position')

      const visuals = self.get('visuals')?.innerCollection

      if (!visuals) return self.set('visuals', yield* this.list(visual))
      if(visuals.includes(visual)) throw new TypeError(visual.module.fullyQualifiedName())

      visuals.push(visual)
    },

    *addVisualIn(self: RuntimeObject, visual: RuntimeObject, position: RuntimeObject): Execution<void> {
      visual.assertIsNotNull()
      position.assertIsNotNull()

      const visuals = self.get('visuals')?.innerCollection
      if (!visuals) self.set('visuals', yield* this.list(visual))
      else {
        if(visuals.includes(visual)) throw new TypeError(visual.module.fullyQualifiedName())
        visuals.push(visual)
      }

      visual.set('position', position)
    },

    *addVisualCharacter(_self: RuntimeObject, visual: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('addVisualCharacter', this.currentContext.get('wollok.gameMirror.gameMirror')!, visual)
    },

    *addVisualCharacterIn(_self: RuntimeObject, visual: RuntimeObject, position: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('addVisualCharacterIn', this.currentContext.get('wollok.gameMirror.gameMirror')!, visual, position)
    },

    *removeVisual(self: RuntimeObject, visual: RuntimeObject): Execution<void> {
      const visuals = self.get('visuals')
      if (visuals) yield* this.invoke('remove', visuals, visual)
    },

    *whenKeyPressedDo(_self: RuntimeObject, event: RuntimeObject, action: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('whenKeyPressedDo', this.currentContext.get('wollok.gameMirror.gameMirror')!, event, action)
    },

    *whenCollideDo(_self: RuntimeObject, visual: RuntimeObject, action: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('whenCollideDo', this.currentContext.get('wollok.gameMirror.gameMirror')!, visual, action)
    },

    *onCollideDo(_self: RuntimeObject, visual: RuntimeObject, action: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('onCollideDo', this.currentContext.get('wollok.gameMirror.gameMirror')!, visual, action)
    },

    *onTick(_self: RuntimeObject, milliseconds: RuntimeObject, name: RuntimeObject, action: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('onTick', this.currentContext.get('wollok.gameMirror.gameMirror')!, milliseconds, name, action)
    },

    *schedule(_self: RuntimeObject, milliseconds: RuntimeObject, action: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('schedule', this.currentContext.get('wollok.gameMirror.gameMirror')!, milliseconds, action)
    },

    *removeTickEvent(_self: RuntimeObject, event: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.invoke('removeTickEvent', this.currentContext.get('wollok.gameMirror.gameMirror')!, event)
    },

    *allVisuals(self: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.list(...self.get('visuals')?.innerCollection ?? [])
    },

    *hasVisual(self: RuntimeObject, visual: RuntimeObject): Execution<RuntimeValue> {
      const visuals: RuntimeObject = self.get('visuals')!
      return yield* !visuals ? this.reify(false) : this.invoke('contains', visuals, visual)
    },

    *getObjectsIn(self: RuntimeObject, position: RuntimeObject): Execution<RuntimeValue> {
      const visuals = (yield* this.invoke('allVisuals', self))!.innerCollection!

      const result: RuntimeObject[] = []
      for(const visual of visuals) {
        const otherPosition = visual.get('position') ?? (yield* this.invoke('position', visual))!
        if((yield *this.invoke('==', position, otherPosition))!.innerBoolean)
          result.push(visual)
      }

      return yield* this.list(...result)
    },

    *say(_self: RuntimeObject, visual: RuntimeObject, message: RuntimeObject): Execution<void> {
      const currentTime = (yield* this.invoke('currentTime', this.rootContext.get('wollok.gameMirror.gameMirror')!))!.innerNumber!

      const messageTime = yield* this.reify(currentTime + 2 * 1000)

      visual.set('message', message)
      visual.set('messageTime', messageTime)
    },

    *clear(self: RuntimeObject): Execution<void> {
      yield* this.invoke('clear', this.currentContext.get('wollok.gameMirror.gameMirror')!)

      self.set('visuals', yield* this.list())
    },

    *colliders(self: RuntimeObject, visual: RuntimeObject): Execution<RuntimeValue> {
      visual.assertIsNotNull()

      const position = visual.get('position') ?? (yield* this.invoke('position', visual))!
      const visualsAtPosition: RuntimeObject = (yield* this.invoke('getObjectsIn', self, position))!

      yield* this.invoke('remove', visualsAtPosition, visual)

      return visualsAtPosition
    },

    *title(self: RuntimeObject, title?: RuntimeObject): Execution<RuntimeValue> {
      if(!title) return self.get('title')
      self.set('title', title)
    },

    *width(self: RuntimeObject, width?: RuntimeObject): Execution<RuntimeValue> {
      if(!width) return self.get('width')
      self.set('width', width)
    },

    *height(self: RuntimeObject, height?: RuntimeObject): Execution<RuntimeValue> {
      if(!height) return self.get('height')
      self.set('height', height)
    },

    *ground(self: RuntimeObject, ground: RuntimeObject): Execution<void> {
      self.set('ground', ground)
    },

    *boardGround(self: RuntimeObject, boardGround: RuntimeObject): Execution<void> {
      self.set('boardGround', boardGround)
    },

    *doCellSize(self: RuntimeObject, size: RuntimeObject): Execution<void> {
      self.set('cellSize', size)
    },

    *stop(self: RuntimeObject): Execution<void> {
      self.set('running', yield* this.reify(false))
    },

    *showAttributes(_self: RuntimeObject, visual: RuntimeObject): Execution<void> {
      visual.set('showAttributes', yield* this.reify(true))
    },

    *hideAttributes(_self: RuntimeObject, visual: RuntimeObject): Execution<void> {
      visual.set('showAttributes', yield* this.reify(false))
    },

    *errorReporter(self: RuntimeObject, visual: RuntimeObject): Execution<void> {
      self.set('errorReporter', visual)
    },

    *doStart(self: RuntimeObject): Execution<RuntimeValue> {
      self.set('running', yield* this.reify(true))
      return yield* this.invoke('doStart', this.currentContext.get('wollok.gameMirror.gameMirror')!)
    },
  },

  Sound: {
    *play(self: RuntimeObject): Execution<void> {
      const game = this.rootContext.get('wollok.game.game')!
      if (!game.get('running')?.innerBoolean) throw new Error('You cannot play a sound if game has not started')

      const sounds = game.get('sounds')?.innerCollection
      if (!sounds) game.set('sounds', yield* this.list(self))
      else {
        if (sounds.includes(self)) throw new TypeError(self.module.fullyQualifiedName())
        else sounds.push(self)
      }

      self.set('status', this.reify('played'))
    },

    *stop(self: RuntimeObject): Execution<void> {
      if (self.get('status')?.innerString !== 'played') throw new Error('You cannot stop a sound that is not played')

      const game = this.currentContext.get('wollok.game.game')!
      const sounds = game.get('sounds')
      if(sounds) yield* this.invoke('remove', sounds, self)

      self.set('status', yield * this.reify('stopped'))
    },

    *pause(self: RuntimeObject): Execution<void> {
      if (self.get('status')?.innerString !== 'played') throw new Error('You cannot pause a sound that is not played')

      self.set('status', this.reify('paused'))
    },

    *resume(self: RuntimeObject): Execution<void> {
      if (self.get('status')?.innerString !== 'paused') throw new Error('You cannot resume a sound that is not paused')

      self.set('status', this.reify('played'))
    },

    *played(self: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.reify(self.get('status')?.innerString === 'played')
    },

    *paused(self: RuntimeObject): Execution<RuntimeValue> {
      return yield* this.reify(self.get('status')?.innerString === 'paused')
    },

    *volume(self: RuntimeObject, newVolume?: RuntimeObject): Execution<RuntimeValue> {
      if(!newVolume) return self.get('volume')

      const volume: RuntimeObject = newVolume
      volume.assertIsNumber()

      if (volume.innerNumber < 0 || volume.innerNumber > 1) throw new RangeError('newVolume')

      self.set('volume', volume)
    },

    *shouldLoop(self: RuntimeObject, looping?: RuntimeObject): Execution<RuntimeValue> {
      if(!looping) return self.get('loop')
      self.set('loop', looping)
    },

  },
}

export default game