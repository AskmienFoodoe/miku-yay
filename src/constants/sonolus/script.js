export const script = 
`
//
// Bandori Engine
// For Sonolus 0.4.6
//
// A recreation of Project Sekai engine
// By Water Boiled Pizza
//



// Note Class

PreprocessNote:Execute(
    Set(EntityData *NoteTailTime Divide(Add(NoteTailTime NoteTimeOffset) Speed))
    Set(EntityData *NoteTailLane Multiply(NoteTailLane MirrorMultiplier))

    And(
        NoteRandom
        Execute(
            Set(EntityData *NoteTailOriginalLane NoteTailLane)
            Set(LevelMemory *NoteMinLane Max(Floor(Divide(Lanes -2)) Subtract(NoteTailOriginalLane 1 Floor(Divide(Lanes 2)))))
            Set(LevelMemory *NoteMaxLane Min(Subtract(Floor(Divide(Lanes 2)) NoteXSize If(Equal(Mod(Lanes 2) 0) 1 0)) Add(NoteTailOriginalLane NoteXSize 1 Floor(Divide(Lanes 2)))))
            And(
                Or(
                    Equal(Archetype 5)
                    Equal(Archetype 6)
                    Equal(Archetype 7)
                )
                Execute(
                    Set(LevelMemory *NoteLaneDiff Add(1 Abs(Subtract(NoteTailOriginalLane NoteHeadOriginalLane))))
                    Set(LevelMemory *NoteMinLane Max(NoteMinLane Subtract(NoteHeadLane NoteLaneDiff)))
                    Set(LevelMemory *NoteMaxLane Min(NoteMaxLane Add(NoteHeadLane NoteLaneDiff)))
                )
            )
            And(
                NoteRef
                Execute(
                    Set(LevelMemory *NoteRefLane GetShifted(EntityDataArray Multiply(NoteRef 32) *NoteTailLane))
                    If(
                        Greater(GetShifted(EntityDataArray Multiply(NoteRef 32) *NoteTailOriginalLane) NoteTailOriginalLane)
                        If(
                            Greater(NoteRefLane NoteMinLane)
                            Set(LevelMemory *NoteMaxLane Max(NoteMinLane Subtract(NoteRefLane 2)))
                            Set(LevelMemory *NoteMinLane Min(NoteMaxLane Add(NoteRefLane 2)))
                        )
                        If(
                            Less(NoteRefLane NoteMaxLane)
                            Set(LevelMemory *NoteMinLane Min(NoteMaxLane Add(NoteRefLane 2)))
                            Set(LevelMemory *NoteMaxLane Max(NoteMaxLane Subtract(NoteRefLane 2)))
                        )
                    )
                )
            )
            Set(EntityData *NoteTailLane RandomInteger(NoteMinLane Add(NoteMaxLane 1)))
        )
    )

    Set(EntityData *NoteHasSimLine
        And(
            Equal(GetShifted(EntityDataArray Multiply(Subtract(Index 1) 32) *NoteTailTime) NoteTailTime)
            NotEqual(Archetype 5)
            NotEqual(GetShifted(EntityInfoArray Multiply(Subtract(Index 1) 3) *Archetype) 5)
        )
    )
    Set(EntityData *NoteTailX Add(Multiply(LaneWidth NoteTailLane) If(Equal(Mod(Lanes 2) 0) Divide(LaneWidth 2) 0)))
    Set(EntityData *NoteTailX1 Subtract(NoteTailX HalfNoteWidth))
    Set(EntityData *NoteTailX2 Add(NoteTailX HalfNoteWidth Multiply(LaneWidth NoteXSize)))
    Set(EntityData *NoteTailSpeedMultiplier
        If(
            NoteSpeedRandom
            If(
                RandomInteger(0 2)
                Random(1 2)
                Divide(1 Random(1 2))
            )
            1
        )
    )
    Set(EntityData *NoteTailSpawnTime Subtract(NoteTailTime Multiply(NoteScreenTime NoteTailSpeedMultiplier)))
)

SpawnOrderHead:NoteHeadSpawnTime
SpawnOrderTail:NoteTailSpawnTime

IsNoteHeadOnScreen:GreaterOr(Time NoteHeadSpawnTime)
IsNoteTailOnScreen:GreaterOr(Time NoteTailSpawnTime)

InitNoteHead:Execute(
    Set(EntityMemory *NoteHeadX Add(Multiply(LaneWidth NoteHeadLane) If(Equal(Mod(Lanes 2) 0) Divide(LaneWidth 2) 0)))
    Set(EntityMemory *NoteHeadX1 Subtract(NoteHeadX HalfNoteWidth))
    Set(EntityMemory *NoteHeadX2 Add(NoteHeadX HalfNoteWidth Multiply(LaneWidth NoteHeadSize)))
)
InitSimLine:And(
    SimLine
    Not(NoteSpeedRandom)
    NoteHasSimLine
    Spawn(7 Index)
)

InitAuto:And(
    Auto
    Execute(
        Set(EntityInput *Judgment JudgmentPerfect)
        Set(EntityInput *Bucket NoteBucket)
        Spawn(
            8
            Or(
                Equal(Archetype 5)
                Equal(Archetype 6)
                Equal(Archetype 7)
            )
            NoteHeadTime
            NoteHeadLane
			NoteHeadSize
            Or(
                Equal(Archetype 4)
                Equal(Archetype 7)
            )
            NoteTailTime
            NoteTailLane
			NoteXSize
            NoteTailX
        )
    )
)

IsNoteTailInGoodWindow:LessOr(Subtract(NoteTailTime Subtract(Time InputOffset)) GoodWindow)

IsTouchY:LessOr(TempTouchY JudgeYMax)
IsTouchXInTailLane:And(GreaterOr(TempTouchX Add(Multiply(NoteTailX1 0.83) Multiply(LaneWidth If(StrictJudgment -0.175 -0.5)))) LessOr(TempTouchX Add(Multiply(NoteTailX2 0.83) Multiply(LaneWidth If(StrictJudgment 0.175 0.5)))))

ProcessTouchHead:And(
    Not(InputState)
    If(
        NoteHeadInputSuccess
        And(
            Equal(TempTouchID NoteHeadInputTouchID)
            Not(TempTouchEnded)
            Execute(
                Set(TemporaryMemory *TempTouchOccupied true)
                Set(EntityMemory *InputState Activated)
                Set(EntitySharedMemory *InputTouchID TempTouchID)
                SpawnHoldEffect
            )
        )
        And(
            Equal(NoteHeadState Despawned)
            GreaterOr(Subtract(Time InputOffset) NoteHeadTime)
            Not(TempTouchOccupied)
            IsTouchY
            And(GreaterOr(TempTouchX Add(Multiply(NoteHeadX1 0.83) Multiply(LaneWidth -0.175))) LessOr(TempTouchX Add(Multiply(NoteHeadX2 0.83) Multiply(LaneWidth 0.175))))
            Execute(
                Set(TemporaryMemory *TempTouchOccupied true)
                Set(EntityMemory *InputState Activated)
                Set(EntitySharedMemory *InputTouchID TempTouchID)
                SpawnHoldEffect
            )
        )
    )
)

ProcessTouchDiscontinue:And(
    TempTouchEnded
    Set(EntityMemory *InputState Terminated)
)

UpdateNoteHeadTimeDistance:Set(EntityMemory *NoteHeadTimeDistance Subtract(Time NoteHeadTime))
UpdateNoteTailTimeDistance:Set(EntityMemory *NoteTailTimeDistance Subtract(Time NoteTailTime))

UpdateNoteTailScale:Set(EntityMemory *NoteTailScale Add(0.05 Multiply(0.95 Power(117.39085 Divide(NoteTailTimeDistance NoteScreenTime NoteTailSpeedMultiplier)))))

DrawNoteTail:Execute(
    Set(EntityMemory *NoteTailScale1 Multiply(NoteBaseY1 NoteTailScale))
    Set(EntityMemory *NoteTailScale2 Multiply(NoteBaseY2 NoteTailScale))
    Set(EntityMemory *NoteTailY1 Add(LaneYOffset Multiply(LaneYMultiplier NoteTailScale1)))
    Set(EntityMemory *NoteTailY2 Add(LaneYOffset Multiply(LaneYMultiplier NoteTailScale2)))
    Draw(
        NoteTexture
        Multiply(NoteTailScale1 NoteTailX1 0.83) NoteTailY1
        Multiply(NoteTailScale2 NoteTailX1 0.83) NoteTailY2
        Multiply(NoteTailScale2 NoteTailX2 0.83) NoteTailY2
        Multiply(NoteTailScale1 NoteTailX2 0.83) NoteTailY1
        LayerNoteBody
        1
    )
)

DrawNoteTailArrow:Execute(
    Set(EntityMemory *NoteTailY Add(LaneYOffset Multiply(LaneYMultiplier NoteTailScale)))
    Draw(
        TextureArrow
        Multiply(NoteTailScale NoteTailX1 0.83) NoteTailY
        Multiply(NoteTailScale NoteTailX1 0.83) Add(NoteTailY Multiply(NoteTailScale NoteWidth))
        Multiply(NoteTailScale NoteTailX2 0.83) Add(NoteTailY Multiply(NoteTailScale NoteWidth))
        Multiply(NoteTailScale NoteTailX2 0.83) NoteTailY
        LayerNoteMarker
        1
    )
)

DrawNoteSlide:And(
    Greater(NoteTailTime Time)
    Execute(
        If(
            Or(
                InputState
                And(
                    Auto
                    GreaterOr(Time NoteHeadTime)
                )
            )
            Execute(
                Set(EntityMemory *NoteHeadScale 1)
                Set(EntityMemory *NoteHeadY LaneY1)

                Set(EntityMemory *NoteHeadX Add(Multiply(LaneWidth RemapClamped(NoteHeadTime NoteTailTime NoteHeadLane NoteTailLane Time)) If(Equal(Mod(Lanes 2) 0) Divide(LaneWidth 2) 0)))

                Set(EntityMemory *NoteHeadX1 Subtract(NoteHeadX HalfNoteWidth))
                Set(EntityMemory *NoteHeadX2 Add(NoteHeadX HalfNoteWidth Multiply(LaneWidth RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time))))

                Draw(
                    TextureSlide
                    Multiply(NoteBaseY1 NoteHeadX1 0.83) Subtract(LaneY1 NoteHeight)
                    Multiply(NoteBaseY2 NoteHeadX1 0.83) Add(LaneY1 NoteHeight)
                    Multiply(NoteBaseY2 NoteHeadX2 0.83) Add(LaneY1 NoteHeight)
                    Multiply(NoteBaseY1 NoteHeadX2 0.83) Subtract(LaneY1 NoteHeight)
                    LayerNoteSlide
                    1
                )

                And(
                    Not(Auto)
                    NoteEffect
                    Execute(
                        MoveParticleEffect(
                            HoldEffectLID
							Multiply(0.83 NoteHeadX1) LaneY1
							Multiply(0.83 NoteHeadX1) TapEffectLY2
							Multiply(0.83 NoteHeadX2) TapEffectLY2
							Multiply(0.83 NoteHeadX2) LaneY1
                        )
                        MoveParticleEffect(
                            HoldEffectCID
							Multiply(0.83 NoteHeadX1) Add(LaneY1 Multiply(Subtract(HoldEffectCY1 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
							Multiply(0.83 NoteHeadX1) Add(LaneY1 Multiply(Subtract(HoldEffectCY2 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
							Multiply(0.83 NoteHeadX2) Add(LaneY1 Multiply(Subtract(HoldEffectCY2 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
							Multiply(0.83 NoteHeadX2) Add(LaneY1 Multiply(Subtract(HoldEffectCY1 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
                        )
                    )
                )
            )
            Execute(
                Set(EntityMemory *NoteHeadScale Add(0.05 Multiply(0.95 Power(117.39085 Divide(NoteHeadTimeDistance NoteScreenTime NoteHeadSpeedMultiplier)))))
                Set(EntityMemory *NoteHeadY Add(LaneYOffset Multiply(LaneYMultiplier NoteHeadScale)))
            )
        )

        And(
            Not(Auto)
            NoteEffect
            GreaterOr(Time NoteHeadTime)
            Not(InputState)
            NoteHeadHoldEffectLID
            Execute(
                Set(EntityMemory *NoteHeadX Add(Multiply(LaneWidth RemapClamped(NoteHeadTime NoteTailTime NoteHeadLane NoteTailLane Time)) If(Equal(Mod(Lanes 2) 0) Divide(LaneWidth 2) 0)))
                Set(EntityMemory *NoteHeadX1 Subtract(NoteHeadX HalfNoteWidth))
                Set(EntityMemory *NoteHeadX2 Add(NoteHeadX HalfNoteWidth Multiply(LaneWidth RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time))))


                MoveParticleEffect(
                    NoteHeadHoldEffectLID
					Multiply(0.83 NoteHeadX1) LaneY1
					Multiply(0.83 NoteHeadX1) TapEffectLY2
					Multiply(0.83 NoteHeadX2) TapEffectLY2
					Multiply(0.83 NoteHeadX2) LaneY1
                )
                MoveParticleEffect(
                    NoteHeadHoldEffectCID
					Multiply(0.83 NoteHeadX1) Add(LaneY1 Multiply(Subtract(HoldEffectCY1 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
					Multiply(0.83 NoteHeadX1) Add(LaneY1 Multiply(Subtract(HoldEffectCY2 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
					Multiply(0.83 NoteHeadX2) Add(LaneY1 Multiply(Subtract(HoldEffectCY2 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
					Multiply(0.83 NoteHeadX2) Add(LaneY1 Multiply(Subtract(HoldEffectCY1 LaneY1) 0.25 RemapClamped(NoteHeadTime NoteTailTime NoteHeadSize NoteXSize Time)))
                )
            )
        )

        Set(EntityMemory *NoteTailY Add(LaneYOffset Multiply(LaneYMultiplier NoteTailScale)))

        Draw(
            TextureLong
            Multiply(NoteHeadScale NoteHeadX1 0.83) NoteHeadY
            Multiply(NoteTailScale NoteTailX1 0.83) NoteTailY
            Multiply(NoteTailScale NoteTailX2 0.83) NoteTailY
            Multiply(NoteHeadScale NoteHeadX2 0.83) NoteHeadY
            LayerNoteConnector
            ConnectorAlpha
        )
    )
)

SpawnHoldEffect:And(
    NoteEffect
    Execute(
        Set(EntitySharedMemory *HoldEffectLID
            SpawnParticleEffect(
                ParticleEffectTapHoldL
				Multiply(0.83 NoteHeadX1) LaneY1
				Multiply(0.83 NoteHeadX1) TapEffectLY2
				Multiply(0.83 NoteHeadX2) TapEffectLY2
				Multiply(0.83 NoteHeadX2) LaneY1
                1
                1
            )
        )
        Set(EntitySharedMemory *HoldEffectCID
            SpawnParticleEffect(
                ParticleEffectTapHoldC
				Multiply(0.83 NoteHeadX1) Add(LaneY1 Multiply(0.25 NoteHeadSize Subtract(HoldEffectCY1 LaneY1)))
				Multiply(0.83 NoteHeadX1) Add(LaneY1 Multiply(0.25 NoteHeadSize Subtract(HoldEffectCY1 LaneY1)))
				Multiply(0.83 NoteHeadX2) Add(LaneY1 Multiply(0.25 NoteHeadSize Subtract(HoldEffectCY1 LaneY1)))
				Multiply(0.83 NoteHeadX2) Add(LaneY1 Multiply(0.25 NoteHeadSize Subtract(HoldEffectCY1 LaneY1)))
                1
                1
            )
        )
    )
)
DestroyHoldEffect:Or(
    Not(NoteEffect)
    DestroyParticleEffect(HoldEffectLID)
    DestroyParticleEffect(HoldEffectCID)
    true
)

PlayTapEffect:And(
    NoteEffect
    Execute(
        SpawnParticleEffect(
            ParticleEffectTapNormalL
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) LaneY1
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) TapEffectLY2
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) TapEffectLY2
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) LaneY1
            0.4
            0
        )
		SpawnParticleEffect(
			ParticleEffectTapNormalC
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY1 LaneY1)))
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY2 LaneY1)))
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY2 LaneY1)))
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY1 LaneY1)))
			0.6
			0
		)
    )
)
PlayFlickEffect:And(
    NoteEffect
    Execute(
        SpawnParticleEffect(
            ParticleEffectTapFlickL
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) LaneY1
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) TapEffectLY2
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) TapEffectLY2
            Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) LaneY1
            0.4
            0
        )
        SpawnParticleEffect(
            ParticleEffectTapFlickC
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY1 LaneY1)))
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY2 LaneY1)))
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY2 LaneY1)))
			Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 NoteXSize Floor(Divide(Lanes 2)) NoteTailLane))) Add(LaneY1 Multiply(0.25 NoteXSize Subtract(TapEffectCY1 LaneY1)))
            0.6
            0
        )
    )
)
PlayLaneEffect:And(
    LaneEffect
    SpawnParticleEffect(
        ParticleEffectLaneL
        GetShifted(LevelData *LaneBX Add(NoteTailLane Floor(Divide(Lanes 2)))) -1
        GetShifted(LevelData *LaneTX Add(NoteTailLane Floor(Divide(Lanes 2)))) LaneY2
        GetShifted(LevelData *LaneTX Add(NoteTailLane Floor(Divide(Lanes 2)) 1 NoteXSize)) LaneY2
        GetShifted(LevelData *LaneBX Add(NoteTailLane Floor(Divide(Lanes 2)) 1 NoteXSize)) -1
        0.2
        0
    )
)

PlayJudgmentSound:And(
    SoundEffect
    Play(Judgment MinEffectTime)
)
PlayFlickSound:And(
    SoundEffect
    Play(EffectFlick MinEffectTime)
)
PlayEmptySound:And(
    SoundEffect
    Play(EffectEmpty MinEffectTime)
)

EvenLanes:If(Equal(Mod(Lanes 2) 0) Divide(LaneWidth 2 1.2) 0)

// #0: Initialization

StageWidth:If(
    StageAspectRatioLock
    If(
        GreaterOr(AspectRatio 1.77778)
        3.55556
        Multiply(AspectRatio 2)
    )
    Multiply(AspectRatio 2)
)
StageHeight:If(
    StageAspectRatioLock
    If(
        GreaterOr(AspectRatio 1.77778)
        2
        Divide(AspectRatio 0.5 1.77778)
    )
    2
)
LaneWidth:Divide(StageWidth Lanes)
LaneYOffset:Divide(StageHeight 2)
LaneYMultiplier:Divide(StageHeight -1.225)
LaneY1:Add(LaneYOffset LaneYMultiplier)
LaneY2:Add(LaneYOffset Multiply(LaneYMultiplier 0.05))
NoteWidth:Multiply(LaneWidth NoteSize)
NoteHeight:Multiply(NoteSize 0.08571 StageHeight 0.5)
HalfNoteWidth:Divide(NoteWidth 2)
NoteBaseY1:Subtract(1 Divide(NoteHeight LaneYMultiplier))
NoteBaseY2:Add(1 Divide(NoteHeight LaneYMultiplier))
TapEffectLY2:Add(LaneY1 Multiply(2 HalfNoteWidth NoteEffectSize))
HalfTapEffectLWidth:Multiply(HalfNoteWidth NoteEffectSize)
HalfTapEffectCWidth:Multiply(HalfNoteWidth NoteEffectSize 3)

TapEffectCY1:Subtract(LaneY1 Multiply(HalfNoteWidth NoteEffectSize 2))
TapEffectCY2:Add(LaneY1 Multiply(HalfNoteWidth NoteEffectSize 2))

HalfHoldEffectCWidth:Multiply(HalfNoteWidth NoteEffectSize 1.8)

HoldEffectCY1:Subtract(LaneY1 Multiply(HalfNoteWidth NoteEffectSize 1.2))
HoldEffectCY2:Add(LaneY1 Multiply(HalfNoteWidth NoteEffectSize 1.2))

NoteScreenTime:Divide(Subtract(12 NoteSpeed) 2)
NoteTimeOffset:Divide(LevelAudioOffset 1000)
MirrorMultiplier:If(Mirror -1 1)
InputOffset:Add(DeviceInputOffset Divide(LevelInputOffset 1000))

#0.preprocess:Execute(
    Set(LevelMemory *LevelLooper 0)
    While(
        Less(LevelLooper Add(Lanes 1))
        SetShifted(LevelData *LaneBX LevelLooper Multiply(LaneWidth Subtract(LevelLooper Divide(Lanes 2))))
        SetShifted(LevelData *LaneTX LevelLooper Multiply(0.04 GetShifted(LevelData *LaneBX LevelLooper)))
        Set(LevelMemory *LevelLooper Add(LevelLooper 1))
    )

    SetShifted(LevelUI *UIMenu *UIAnchorX Subtract(AspectRatio 0.05))
    SetShifted(LevelUI *UIMenu *UIAnchorY 0.95)
    SetShifted(LevelUI *UIMenu *UIPivotX 1)
    SetShifted(LevelUI *UIMenu *UIPivotY 1)
    SetShifted(LevelUI *UIMenu *UIWidth 0.15)
    SetShifted(LevelUI *UIMenu *UIHeight 0.15)
    SetShifted(LevelUI *UIMenu *UIAlpha 1)
    SetShifted(LevelUI *UIMenu *UIBackground true)

    SetShifted(LevelUI *UIJudgment *UIAnchorX 0)
    SetShifted(LevelUI *UIJudgment *UIAnchorY Multiply(StageHeight -0.25))
    SetShifted(LevelUI *UIJudgment *UIPivotX 0.5)
    SetShifted(LevelUI *UIJudgment *UIPivotY 0)
    SetShifted(LevelUI *UIJudgment *UIWidth Multiply(0.8 UIJudgmentSize))
    SetShifted(LevelUI *UIJudgment *UIHeight Multiply(0.2 UIJudgmentSize))
    SetShifted(LevelUI *UIJudgment *UIAlpha UIJudgmentAlpha)

    SetShifted(LevelUI *UIComboValue *UIAnchorX Multiply(AspectRatio 0.7))
    SetShifted(LevelUI *UIComboValue *UIAnchorY 0)
    SetShifted(LevelUI *UIComboValue *UIPivotX 0.5)
    SetShifted(LevelUI *UIComboValue *UIPivotY 0)
    SetShifted(LevelUI *UIComboValue *UIWidth Multiply(0.5 UIComboSize))
    SetShifted(LevelUI *UIComboValue *UIHeight Multiply(0.25 UIComboSize))
    SetShifted(LevelUI *UIComboValue *UIAlpha UIComboAlpha)

    SetShifted(LevelUI *UIComboText *UIAnchorX Multiply(AspectRatio 0.7))
    SetShifted(LevelUI *UIComboText *UIAnchorY 0)
    SetShifted(LevelUI *UIComboText *UIPivotX 0.5)
    SetShifted(LevelUI *UIComboText *UIPivotY 1)
    SetShifted(LevelUI *UIComboText *UIWidth Multiply(0.5 UIComboSize))
    SetShifted(LevelUI *UIComboText *UIHeight Multiply(0.15 UIComboSize))
    SetShifted(LevelUI *UIComboText *UIAlpha UIComboAlpha)

    SetShifted(LevelUI *UIScoreBar *UIAnchorX Subtract(0.05 AspectRatio))
    SetShifted(LevelUI *UIScoreBar *UIAnchorY 0.95)
    SetShifted(LevelUI *UIScoreBar *UIPivotX 0)
    SetShifted(LevelUI *UIScoreBar *UIPivotY 1)
    SetShifted(LevelUI *UIScoreBar *UIWidth 0.75)
    SetShifted(LevelUI *UIScoreBar *UIHeight 0.15)
    SetShifted(LevelUI *UIScoreBar *UIAlpha 1)
    SetShifted(LevelUI *UIScoreBar *UIHorizontalAlign -1)
    SetShifted(LevelUI *UIScoreBar *UIBackground true)

    SetShifted(LevelUI *UIScoreValue *UIAnchorX Subtract(0.2 AspectRatio))
    SetShifted(LevelUI *UIScoreValue *UIAnchorY 0.95)
    SetShifted(LevelUI *UIScoreValue *UIPivotX 0)
    SetShifted(LevelUI *UIScoreValue *UIPivotY 1)
    SetShifted(LevelUI *UIScoreValue *UIWidth 0.6)
    SetShifted(LevelUI *UIScoreValue *UIHeight 0.15)
    SetShifted(LevelUI *UIScoreValue *UIAlpha 1)
    SetShifted(LevelUI *UIScoreValue *UIHorizontalAlign 1)

    SetShifted(LevelUI *UILifeBar *UIAnchorX Subtract(AspectRatio 0.25))
    SetShifted(LevelUI *UILifeBar *UIAnchorY 0.95)
    SetShifted(LevelUI *UILifeBar *UIPivotX 1)
    SetShifted(LevelUI *UILifeBar *UIPivotY 1)
    SetShifted(LevelUI *UILifeBar *UIWidth 0.55)
    SetShifted(LevelUI *UILifeBar *UIHeight 0.15)
    SetShifted(LevelUI *UILifeBar *UIAlpha 1)
    SetShifted(LevelUI *UILifeBar *UIHorizontalAlign -1)
    SetShifted(LevelUI *UILifeBar *UIBackground true)

    SetShifted(LevelUI *UILifeValue *UIAnchorX Subtract(AspectRatio 0.25))
    SetShifted(LevelUI *UILifeValue *UIAnchorY 0.95)
    SetShifted(LevelUI *UILifeValue *UIPivotX 1)
    SetShifted(LevelUI *UILifeValue *UIPivotY 1)
    SetShifted(LevelUI *UILifeValue *UIWidth 0.4)
    SetShifted(LevelUI *UILifeValue *UIHeight 0.15)
    SetShifted(LevelUI *UILifeValue *UIAlpha 1)
    SetShifted(LevelUI *UILifeValue *UIHorizontalAlign 1)

    Set(LevelBucket 0 -50)
    Set(LevelBucket 1 50)
    Set(LevelBucket 2 -100)
    Set(LevelBucket 3 100)
    Set(LevelBucket 4 -150)
    Set(LevelBucket 5 150)

    Set(LevelBucket 6 -50)
    Set(LevelBucket 7 50)
    Set(LevelBucket 8 -100)
    Set(LevelBucket 9 100)
    Set(LevelBucket 10 -150)
    Set(LevelBucket 11 150)

    Set(LevelBucket 12 -50)
    Set(LevelBucket 13 50)
    Set(LevelBucket 14 -100)
    Set(LevelBucket 15 100)
    Set(LevelBucket 16 -150)
    Set(LevelBucket 17 150)

    If(
        StrictJudgment
        Execute(
            Set(LevelBucket 18 0)
            Set(LevelBucket 19 50)
            Set(LevelBucket 20 0)
            Set(LevelBucket 21 100)
            Set(LevelBucket 22 0)
            Set(LevelBucket 23 150)

            Set(LevelBucket 24 -50)
            Set(LevelBucket 25 50)
            Set(LevelBucket 26 -100)
            Set(LevelBucket 27 100)
            Set(LevelBucket 28 -150)
            Set(LevelBucket 29 150)

            Set(LevelBucket 30 0)
            Set(LevelBucket 31 50)
            Set(LevelBucket 32 0)
            Set(LevelBucket 33 100)
            Set(LevelBucket 34 0)
            Set(LevelBucket 35 150)
        )
        Execute(
            Set(LevelBucket 18 0)
            Set(LevelBucket 19 200)
            Set(LevelBucket 20 0)
            Set(LevelBucket 21 200)
            Set(LevelBucket 22 0)
            Set(LevelBucket 23 200)

            Set(LevelBucket 24 -50)
            Set(LevelBucket 25 200)
            Set(LevelBucket 26 -100)
            Set(LevelBucket 27 200)
            Set(LevelBucket 28 -150)
            Set(LevelBucket 29 200)

            Set(LevelBucket 30 0)
            Set(LevelBucket 31 200)
            Set(LevelBucket 32 0)
            Set(LevelBucket 33 200)
            Set(LevelBucket 34 0)
            Set(LevelBucket 35 200)
        )
    )

    Set(LevelScore *PerfectScoreMultiplier 1)
    Set(LevelScore *GreatScoreMultiplier 0.8)
    Set(LevelScore *GoodScoreMultiplier 0.5)

    SetShifted(LevelScore *ConsecutiveGreatScore *ConsecutiveScoreMultiplier 0.01)
    SetShifted(LevelScore *ConsecutiveGreatScore *ConsecutiveScoreStep 100)
    SetShifted(LevelScore *ConsecutiveGreatScore *ConsecutiveScoreCap 1000)

    SetShifted(ArchetypeLife Multiply(2 4) *MissLifeIncrement -100)
    SetShifted(ArchetypeLife Multiply(3 4) *MissLifeIncrement -100)
    SetShifted(ArchetypeLife Multiply(4 4) *MissLifeIncrement -100)
    SetShifted(ArchetypeLife Multiply(5 4) *MissLifeIncrement -20)
    SetShifted(ArchetypeLife Multiply(6 4) *MissLifeIncrement -100)
    SetShifted(ArchetypeLife Multiply(7 4) *MissLifeIncrement -100)
)

#0.spawnOrder:-1000

#0.updateSequential:true



// #1: Stage

JudgeX1:Multiply(-1 AspectRatio)
JudgeX2:Multiply(1 AspectRatio)
HalfJudgeHeight:Divide(NoteHeight NoteSize 2)
JudgeY1:Subtract(LaneY1 HalfJudgeHeight)
JudgeY2:Add(LaneY1 HalfJudgeHeight)
HalfSlotSize:Multiply(HalfJudgeHeight 0.85)
StageBorderBL:Add(Multiply(LaneWidth -0.2) JudgeX1)
StageBorderBR:Add(Multiply(LaneWidth 0.2) JudgeX2)
StageBorderTL:Multiply(0.04 StageBorderBL)
StageBorderTR:Multiply(0.04 StageBorderBR)
StageCoverY:Lerp(LaneY2 LaneY1 StageCover)

#1.spawnOrder:-999

#1.shouldSpawn:Equal(Get(EntityInfoArray *State) Despawned)

#1.initialize:Execute(
    Set(EntityMemory *AutoNoteInfoOffset 6)
    Set(EntityMemory *AutoNoteDataOffset 64)

    Set(EntityMemory *Looper 0)
    While(
        Less(Looper Lanes)
        SetShifted(EntityMemory *SlotX1 Looper Subtract(Add(Multiply(0.83 LaneWidth Subtract(Looper Floor(Divide(Lanes 2)))) EvenLanes) HalfSlotSize))
        SetShifted(EntityMemory *SlotX2 Looper Add(Multiply(0.83 LaneWidth Subtract(Looper Floor(Divide(Lanes 2)))) EvenLanes HalfSlotSize))
        SetShifted(EntityMemory *SlotY1 Looper Subtract(LaneY1 HalfSlotSize))
        SetShifted(EntityMemory *SlotY2 Looper Add(LaneY1 HalfSlotSize))
        Set(EntityMemory *Looper Add(Looper 1))
    )
)

#1.updateSequential:And(
    StageTilt
    Execute(
        Set(LevelTransform 4 Multiply(0.5 Add(Get(LevelTransform 4) Divide(Tilt AspectRatio -10))))
        Set(LevelMemory *Tilt 0)
    )
)

#1.updateParallel:Execute(
    And(
        Auto
        SoundEffect
        And(AutoNoteArchetype)
        GreaterOr(Time Subtract(AutoNoteTailTime 1))
        Execute(
            PlayScheduled(
                If(
                    Or(
                        Equal(AutoNoteArchetype 4)
                        Equal(AutoNoteArchetype 7)
                    )
                    EffectFlick
                    EffectPerfect
                )
                AutoNoteTailTime
                MinEffectTime
            )
            Set(EntityMemory *AutoNoteInfoOffset Add(AutoNoteInfoOffset 3))
            Set(EntityMemory *AutoNoteDataOffset Add(AutoNoteDataOffset 32))
        )
    )

    And(
        StageCover
        Draw(
            TextureStageCover
            JudgeX1 StageCoverY
            JudgeX1 1
            JudgeX2 1
            JudgeX2 StageCoverY
            LayerStageCover
            1
        )
    )

    Draw(
        TextureJudgeLine
        JudgeX1 JudgeY1
        JudgeX1 JudgeY2
        JudgeX2 JudgeY2
        JudgeX2 JudgeY1
        LayerJudgeLine
        1
    )
    Draw(
        TextureStageL
        StageBorderBL -1
        StageBorderTL LaneY2
        GetShifted(LevelData *LaneTX 0) LaneY2
        GetShifted(LevelData *LaneBX 0) -1
        LayerStage
        1
    )
    Draw(
        TextureStageR
        GetShifted(LevelData *LaneBX Lanes) -1
        GetShifted(LevelData *LaneTX Lanes) LaneY2
        StageBorderTR LaneY2
        StageBorderBR -1
        LayerStage
        1
    )

    Set(EntityMemory *Looper 0)
    While(
        Less(Looper Lanes)
        Draw(
            TextureLane
            GetShifted(LevelData *LaneBX Looper) -1
            GetShifted(LevelData *LaneTX Looper) LaneY2
            GetShifted(LevelData *LaneTX Add(Looper 1)) LaneY2
            GetShifted(LevelData *LaneBX Add(Looper 1)) -1
            LayerStage
            1
        )
		
        Draw(
            TextureSlot
            GetShifted(EntityMemory *SlotX1 Looper) GetShifted(EntityMemory *SlotY1 Looper)
            GetShifted(EntityMemory *SlotX1 Looper) GetShifted(EntityMemory *SlotY2 Looper)
            GetShifted(EntityMemory *SlotX2 Looper) GetShifted(EntityMemory *SlotY2 Looper)
            GetShifted(EntityMemory *SlotX2 Looper) GetShifted(EntityMemory *SlotY1 Looper)
            LayerSlot
            1
        )
        Set(EntityMemory *Looper Add(Looper 1))
    )
)

#1.touch@1:Or(
    Auto
    And(
        TempTouchStarted
        IsTouchY
        Not(TempTouchOccupied)
        Execute(
            Set(EntityMemory *Looper 0)
            While(
                Less(Looper Lanes)
                And(
                    GreaterOr(TempTouchX Multiply(GetShifted(LevelData *LaneBX Looper) 0.83))
                    LessOr(TempTouchX Multiply(GetShifted(LevelData *LaneBX Add(Looper 1)) 0.83))
                    Execute(
                        PlayEmptySound
                        And(
                            SlotEffect
                            SpawnParticleEffect(
                                ParticleEffectSlotL
                                Multiply(GetShifted(LevelData *LaneBX Looper) 0.83) LaneY1
                                Multiply(GetShifted(LevelData *LaneBX Looper) 0.83) TapEffectLY2
                                Multiply(GetShifted(LevelData *LaneBX Add(Looper 1)) 0.83) TapEffectLY2
                                Multiply(GetShifted(LevelData *LaneBX Add(Looper 1)) 0.83) LaneY1
                                0.6
                                0
                            )
                        )
                        And(
                            LaneEffect
                            SpawnParticleEffect(
                                ParticleEffectLaneL
                                GetShifted(LevelData *LaneBX Looper) -1
                                GetShifted(LevelData *LaneTX Looper) LaneY2
                                GetShifted(LevelData *LaneTX Add(Looper 1)) LaneY2
                                GetShifted(LevelData *LaneBX Add(Looper 1)) -1
                                0.2
                                0
                            )
                        )
                    )
                )
                Set(EntityMemory *Looper Add(Looper 1))
            )
        )
    )
)



// #2: Tap Note

#2.preprocess:PreprocessNote

#2.spawnOrder:SpawnOrderTail

#2.shouldSpawn:IsNoteTailOnScreen

#2.initialize:Execute(
    InitSimLine
    InitAuto
)

#2.touch:Or(
    Auto
    And(
        Not(InputState)
        IsNoteTailInGoodWindow
        TempTouchStarted
        Not(TempTouchOccupied)
        IsTouchY
        IsTouchXInTailLane
        Execute(
            Set(TemporaryMemory *TempTouchOccupied true)
            Set(EntityMemory *InputState Terminated)
            Set(EntitySharedMemory *InputSuccess true)
            Set(EntitySharedMemory *InputTouchID TempTouchID)
            Set(EntityInput *Judgment JudgeSimple(Subtract(TempTouchST InputOffset) NoteTailTime PerfectWindow GreatWindow GoodWindow))
            Set(EntityInput *Bucket NoteBucket)
            Set(EntityInput *BucketValue Multiply(1000 Subtract(TempTouchST InputOffset NoteTailTime)))
            PlayLaneEffect
            PlayTapEffect
            PlayJudgmentSound
        )
    )
)

#2.updateParallel:Execute(
    UpdateNoteTailTimeDistance
    Or(
        And(
            Auto
            GreaterOr(Time NoteTailTime)
        )
        Equal(InputState Terminated)
        Greater(Subtract(NoteTailTimeDistance InputOffset) GoodWindow)
        Execute(
            UpdateNoteTailScale
            DrawNoteTail
        )
    )
)



// #3: Flick Note

#3.preprocess:PreprocessNote

#3.spawnOrder:SpawnOrderTail

#3.shouldSpawn:IsNoteTailOnScreen

#3.initialize:Execute(
    InitSimLine
    InitAuto
)

#3.touch:Or(
    Auto
    Execute(
        And(
            Not(InputState)
            IsNoteTailInGoodWindow
            TempTouchStarted
            Not(TempTouchOccupied)
            IsTouchY
            IsTouchXInTailLane
            Execute(
                Set(TemporaryMemory *TempTouchOccupied true)
                Set(EntityMemory *InputState Activated)
                Set(EntityMemory *ActivationTime TempTouchST)
                Set(EntitySharedMemory *InputTouchID TempTouchID)
            )
        )
        And(
            InputState
            NotEqual(InputState Terminated)
            Equal(TempTouchID InputTouchID)
            Execute(
                Set(TemporaryMemory *TempTouchOccupied true)
                And(
                    IsNoteTailInGoodWindow
                    GreaterOr(TempTouchVR MinVR)
                    Execute(
                        Set(EntityMemory *InputState Terminated)
                        Set(EntitySharedMemory *InputSuccess true)
                        Set(EntityInput *Judgment JudgeSimple(Subtract(ActivationTime InputOffset) NoteTailTime PerfectWindow GreatWindow GoodWindow))
                        Set(EntityInput *Bucket NoteBucket)
                        Set(EntityInput *BucketValue Multiply(1000 Subtract(ActivationTime InputOffset NoteTailTime)))
                        PlayLaneEffect
                        PlayFlickEffect
                        PlayFlickSound
                    )
                )
                ProcessTouchDiscontinue
            )
        )
    )
)

#3.updateParallel:Execute(
    UpdateNoteTailTimeDistance
    Or(
        And(
            Auto
            GreaterOr(Time NoteTailTime)
        )
        Equal(InputState Terminated)
        Greater(Subtract(NoteTailTimeDistance InputOffset) GoodWindow)
        Execute(
            UpdateNoteTailScale
            DrawNoteTail
            DrawNoteTailArrow
        )
    )
)



// #4: Slide Touch Note

#4.preprocess:PreprocessNote

#4.spawnOrder:SpawnOrderHead

#4.shouldSpawn:IsNoteHeadOnScreen

#4.initialize:Execute(
    InitNoteHead
    InitAuto
)

#4.touch:Or(
    Auto
    Execute(
        ProcessTouchHead
        And(
            InputState
            NotEqual(InputState Terminated)
            //Equal(TempTouchID InputTouchID)
			
			IsTouchY
			IsTouchXInTailLane
			//GreaterOr(Subtract(TempTouchT TempTouchST) Subtract(NoteTailTime NoteHeadTime))
			GreaterOr(Subtract(Time InputOffset) NoteTailTime)
            Execute(
                Set(TemporaryMemory *TempTouchOccupied true)
                Set(LevelMemory *Tilt Add(Tilt TempTouchX))
                And(
					GreaterOr(Subtract(Time InputOffset) NoteTailTime)

                    Execute(
                        Set(EntityMemory *InputState Terminated)
                        Set(EntitySharedMemory *InputSuccess true)
                        Set(EntityInput *Judgment JudgeSimple(Subtract(Time InputOffset) NoteTailTime PerfectWindow GreatWindow GoodWindow))
                        Set(EntityInput *Bucket NoteBucket)
                        Set(EntityInput *BucketValue Multiply(1000 Subtract(Time InputOffset NoteTailTime)))
                        PlayLaneEffect
                        PlayTapEffect
                        PlayJudgmentSound
                    )
                )
				ProcessTouchDiscontinue
            )
        )
    )
)

#4.updateParallel:Execute(
    UpdateNoteHeadTimeDistance
    UpdateNoteTailTimeDistance
    Or(
        And(
            Auto
            GreaterOr(Time NoteTailTime)
        )
        And(
            Not(Auto)
            Not(InputState)
            Greater(Subtract(NoteHeadTimeDistance InputOffset) GoodWindow)
        )
        And(
            Equal(InputState Terminated)
            DestroyHoldEffect
        )
        And(
            Greater(Subtract(NoteTailTimeDistance InputOffset) GoodWindow)
            DestroyHoldEffect
        )
        Execute(
            UpdateNoteTailScale
            DrawNoteSlide
            And(
                IsNoteTailOnScreen
                DrawNoteTail
            )
        )
    )
)



// #5: Slide Release Note

#5.preprocess:PreprocessNote

#5.spawnOrder:SpawnOrderHead

#5.shouldSpawn:IsNoteHeadOnScreen

#5.initialize:Execute(
    InitNoteHead
    InitSimLine
    InitAuto
)

#5.touch:Or(
    Auto
    Execute(
        ProcessTouchHead
        And(
            InputState
            NotEqual(InputState Terminated)
            //Equal(TempTouchID InputTouchID)
			
			IsTouchY
            IsTouchXInTailLane
			//GreaterOr(Subtract(TempTouchT TempTouchST) Subtract(NoteTailTime NoteHeadTime))
			GreaterOr(Subtract(Time InputOffset Multiply(-1 PerfectWindow)) NoteTailTime)
            Execute(
                Set(TemporaryMemory *TempTouchOccupied true)
                Set(LevelMemory *Tilt Add(Tilt TempTouchX))
                And(
                    TempTouchEnded
					IsNoteTailInGoodWindow

                    Execute(
                        Set(EntityMemory *InputState Terminated)
                        Set(EntitySharedMemory *InputSuccess true)
                        Set(EntityInput *Judgment JudgeSimple(Subtract(TempTouchT InputOffset) NoteTailTime PerfectWindow GreatWindow GoodWindow))
                        Set(EntityInput *Bucket NoteBucket)
                        Set(EntityInput *BucketValue Multiply(1000 Subtract(TempTouchT InputOffset NoteTailTime)))
                        PlayLaneEffect
                        PlayTapEffect
                        PlayJudgmentSound
                    )
                )
				ProcessTouchDiscontinue
            )
        )
    )
)

#5.updateParallel:Execute(
    UpdateNoteHeadTimeDistance
    UpdateNoteTailTimeDistance
    Or(
        And(
            Auto
            GreaterOr(Time NoteTailTime)
        )
        And(
            Not(Auto)
            Not(InputState)
            Greater(Subtract(NoteHeadTimeDistance InputOffset) GoodWindow)
        )
        And(
            Equal(InputState Terminated)
            DestroyHoldEffect
        )
        And(
            Greater(Subtract(NoteTailTimeDistance InputOffset) GoodWindow)
            DestroyHoldEffect
        )
        Execute(
            UpdateNoteTailScale
            DrawNoteSlide
            And(
                IsNoteTailOnScreen
                DrawNoteTail
            )
        )
    )
)



// #6: Slide Flick Note

#6.preprocess:PreprocessNote

#6.spawnOrder:SpawnOrderHead

#6.shouldSpawn:IsNoteHeadOnScreen

#6.initialize:Execute(
    InitNoteHead
    InitSimLine
    InitAuto
)

#6.touch:Or(
    Auto
    Execute(
        ProcessTouchHead
        And(
            InputState
            NotEqual(InputState Terminated)
            //Equal(TempTouchID InputTouchID)
			
			IsTouchY
            IsTouchXInTailLane
			//GreaterOr(Subtract(TempTouchT TempTouchST) Subtract(NoteTailTime NoteHeadTime))
			GreaterOr(Subtract(Time InputOffset) NoteTailTime)
            Execute(
                Set(TemporaryMemory *TempTouchOccupied true)
                Set(LevelMemory *Tilt Add(Tilt TempTouchX))
                And(
                    Equal(InputState Activated)

                    Set(EntityMemory *InputState ActivatedNext)
                )
                And(
                    Equal(InputState ActivatedNext)
                    GreaterOr(TempTouchVR MinVR)
                    Execute(
                        Set(EntityMemory *InputState Terminated)
                        Set(EntitySharedMemory *InputSuccess true)
                        Set(EntityInput *Judgment JudgeSimple(Subtract(Time InputOffset) NoteTailTime PerfectWindow GreatWindow GoodWindow))
                        Set(EntityInput *Bucket NoteBucket)
                        Set(EntityInput *BucketValue Multiply(1000 Subtract(Time InputOffset NoteTailTime)))
                        PlayLaneEffect
                        PlayFlickEffect
                        PlayFlickSound
                    )
                )
				ProcessTouchDiscontinue
            )
        )
    )
)

#6.updateParallel:Execute(
    UpdateNoteHeadTimeDistance
    UpdateNoteTailTimeDistance
    Or(
        And(
            Auto
            GreaterOr(Time NoteTailTime)
        )
        And(
            Not(Auto)
            Not(InputState)
            Greater(Subtract(NoteHeadTimeDistance InputOffset) GoodWindow)
        )
        And(
            Equal(InputState Terminated)
            DestroyHoldEffect
        )
        And(
            Greater(Subtract(NoteTailTimeDistance InputOffset) GoodWindow)
            DestroyHoldEffect
        )
        Execute(
            UpdateNoteTailScale
            DrawNoteSlide
            And(
                IsNoteTailOnScreen
                Execute(
                    DrawNoteTail
                    DrawNoteTailArrow
                )
            )
        )
    )
)



// #7: Sim Line

#7.initialize:Execute(
    Set(EntityMemory *SimLineIndex2 Subtract(SimLineIndex1 1))
    Set(EntityMemory *SimLineTime SimLineTime1)
    Set(EntityMemory *SimLineX1 Multiply(SimLineLane1 LaneWidth))
    Set(EntityMemory *SimLineX2 Multiply(SimLineLane2 LaneWidth))
)

#7.updateParallel:Or(
    And(
        Auto
        GreaterOr(Time SimLineTime)
    )
    Equal(SimLineState1 Despawned)
    Equal(SimLineState2 Despawned)
    And(
        LessOr(Subtract(SimLineTime Time) NoteScreenTime)
        Execute(
            Set(EntityMemory *SimLineTimeDistance Subtract(Time SimLineTime))
            Set(EntityMemory *SimLineScale Add(0.05 Multiply(0.95 Power(117.39085 Divide(SimLineTimeDistance NoteScreenTime)))))
            Set(EntityMemory *SimLineScale1 Multiply(NoteBaseY1 SimLineScale))
            Set(EntityMemory *SimLineScale2 Multiply(NoteBaseY2 SimLineScale))
            Set(EntityMemory *SimLineY1 Add(LaneYOffset Multiply(LaneYMultiplier SimLineScale1)))
            Set(EntityMemory *SimLineY2 Add(LaneYOffset Multiply(LaneYMultiplier SimLineScale2)))
            Draw(
                TextureSimLine
                Multiply(SimLineScale1 SimLineX1 0.83) SimLineY1
                Multiply(SimLineScale2 SimLineX1 0.83) SimLineY2
                Multiply(SimLineScale2 SimLineX2 0.83) SimLineY2
                Multiply(SimLineScale1 SimLineX2 0.83) SimLineY1
                LayerSimLine
                1
            )
        )
    )
)



// #8: Auto Companion

#8.initialize:And(
    CompanionHasHead
    Set(EntityMemory *CompanionHeadX Multiply(LaneWidth CompanionHeadLane))
)

#8.updateSequential:And(
    StageTilt
    CompanionHasHead
    GreaterOr(Time CompanionHeadTime)
    Less(Time CompanionTailTime)
    Set(LevelMemory *Tilt Add(Tilt RemapClamped(CompanionHeadTime CompanionTailTime CompanionHeadX CompanionTailX Time)))
)

#8.updateParallel:If(
    GreaterOr(Time CompanionTailTime)
    Execute(
        And(
            NoteEffect
            Execute(
                DestroyParticleEffect(CompanionHoldEffectLID)
                DestroyParticleEffect(CompanionHoldEffectCID)
            )
        )

        And(
            NoteEffect
            Execute(
                SpawnParticleEffect(
                    If(
                        CompanionIsFlick
                        ParticleEffectTapFlickL
                        ParticleEffectTapNormalL
                    )
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) CompanionTailLane))) LaneY1
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) CompanionTailLane))) TapEffectLY2
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 CompanionTailSize Floor(Divide(Lanes 2)) CompanionTailLane))) TapEffectLY2
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 CompanionTailSize Floor(Divide(Lanes 2)) CompanionTailLane))) LaneY1
                    0.4
                    0
                )
                SpawnParticleEffect(
                    If(
                        CompanionIsFlick
                        ParticleEffectTapFlickC
                        ParticleEffectTapNormalC
                    )
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) CompanionTailLane))) Add(LaneY1 Multiply(0.25 CompanionTailSize Subtract(TapEffectCY1 LaneY1)))
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(Floor(Divide(Lanes 2)) CompanionTailLane))) Add(LaneY1 Multiply(0.25 CompanionTailSize Subtract(TapEffectCY2 LaneY1)))
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 CompanionTailSize Floor(Divide(Lanes 2)) CompanionTailLane))) Add(LaneY1 Multiply(0.25 CompanionTailSize Subtract(TapEffectCY2 LaneY1)))
					Multiply(0.83 GetShifted(LevelData *LaneBX Add(1 CompanionTailSize Floor(Divide(Lanes 2)) CompanionTailLane))) Add(LaneY1 Multiply(0.25 CompanionTailSize Subtract(TapEffectCY1 LaneY1)))
                    0.6
                    0
                )
            )
        )

        And(
            LaneEffect
            SpawnParticleEffect(
                ParticleEffectLaneL
				GetShifted(LevelData *LaneBX Add(CompanionTailLane Floor(Divide(Lanes 2)))) -1
				GetShifted(LevelData *LaneTX Add(CompanionTailLane Floor(Divide(Lanes 2)))) LaneY2
				GetShifted(LevelData *LaneTX Add(CompanionTailLane Floor(Divide(Lanes 2)) 1 CompanionTailSize)) LaneY2
				GetShifted(LevelData *LaneBX Add(CompanionTailLane Floor(Divide(Lanes 2)) 1 CompanionTailSize)) -1
                0.2
                0
            )
        )

        true
    )
    And(
        NoteEffect
        CompanionHasHead
        GreaterOr(Time CompanionHeadTime)
        Execute(
            And(
                Not(CompanionHoldEffectLID)
                Execute(
					Set(EntityMemory *CompanionHeadCurrentX1 Subtract(CompanionHeadX HalfNoteWidth))
					Set(EntityMemory *CompanionHeadCurrentX2 Add(CompanionHeadX HalfNoteWidth Multiply(LaneWidth CompanionHeadSize)))
                    Set(EntityMemory *CompanionHoldEffectLID
                        SpawnParticleEffect(
                            ParticleEffectTapHoldL
							Multiply(0.83 CompanionHeadCurrentX1) LaneY1
							Multiply(0.83 CompanionHeadCurrentX1) TapEffectLY2
							Multiply(0.83 CompanionHeadCurrentX2) TapEffectLY2
							Multiply(0.83 CompanionHeadCurrentX2) LaneY1
                            1
                            1
                        )
                    )
                    Set(EntityMemory *CompanionHoldEffectCID
                        SpawnParticleEffect(
                            ParticleEffectTapHoldC
							Multiply(0.83 CompanionHeadCurrentX1) Add(LaneY1 Multiply(0.25 CompanionHeadSize Subtract(HoldEffectCY1 LaneY1)))
							Multiply(0.83 CompanionHeadCurrentX1) Add(LaneY1 Multiply(0.25 CompanionHeadSize Subtract(HoldEffectCY2 LaneY1)))
							Multiply(0.83 CompanionHeadCurrentX2) Add(LaneY1 Multiply(0.25 CompanionHeadSize Subtract(HoldEffectCY2 LaneY1)))
							Multiply(0.83 CompanionHeadCurrentX2) Add(LaneY1 Multiply(0.25 CompanionHeadSize Subtract(HoldEffectCY1 LaneY1)))
                            1
                            1
                        )
                    )
                )
            )

			Set(EntityMemory *CompanionHeadCurrentX Add(Multiply(LaneWidth RemapClamped(CompanionHeadTime CompanionTailTime CompanionHeadLane CompanionTailLane Time)) If(Equal(Mod(Lanes 2) 0) Divide(LaneWidth 2) 0)))
			Set(EntityMemory *CompanionHeadCurrentX1 Subtract(CompanionHeadCurrentX HalfNoteWidth))
			Set(EntityMemory *CompanionHeadCurrentX2 Add(CompanionHeadCurrentX HalfNoteWidth Multiply(LaneWidth RemapClamped(CompanionHeadTime CompanionTailTime CompanionHeadSize CompanionTailSize Time))))
            MoveParticleEffect(
                CompanionHoldEffectLID
				Multiply(0.83 CompanionHeadCurrentX1) LaneY1
				Multiply(0.83 CompanionHeadCurrentX1) TapEffectLY2
				Multiply(0.83 CompanionHeadCurrentX2) TapEffectLY2
				Multiply(0.83 CompanionHeadCurrentX2) LaneY1
            )
            MoveParticleEffect(
                CompanionHoldEffectCID
				Multiply(0.83 CompanionHeadCurrentX1) Add(LaneY1 Multiply(Subtract(HoldEffectCY1 LaneY1) 0.25 RemapClamped(CompanionHeadTime CompanionTailTime CompanionHeadSize CompanionTailSize Time)))
				Multiply(0.83 CompanionHeadCurrentX1) Add(LaneY1 Multiply(Subtract(HoldEffectCY2 LaneY1) 0.25 RemapClamped(CompanionHeadTime CompanionTailTime CompanionHeadSize CompanionTailSize Time)))
				Multiply(0.83 CompanionHeadCurrentX2) Add(LaneY1 Multiply(Subtract(HoldEffectCY2 LaneY1) 0.25 RemapClamped(CompanionHeadTime CompanionTailTime CompanionHeadSize CompanionTailSize Time)))
				Multiply(0.83 CompanionHeadCurrentX2) Add(LaneY1 Multiply(Subtract(HoldEffectCY1 LaneY1) 0.25 RemapClamped(CompanionHeadTime CompanionTailTime CompanionHeadSize CompanionTailSize Time)))
            )
        )
    )
)



// Constants

true:1
false:0

Waiting:0
Spawned:1
Despawned:2

Waiting:0
Activated:1
ActivatedNext:2
Terminated:3

PhaseBegan:1
PhaseStationary:2
PhaseMoved:3
PhaseEnded:4

PerfectWindow:0.05
GreatWindow:0.1
GoodWindow:0.15

JudgeYMax:0
MinVR:1.5

MinEffectTime:0.02

LayerStageCover:1000
LayerNoteMarker:101
LayerNoteBody:100
LayerNoteSlide:99
LayerNoteConnector:98
LayerSimLine:97
LayerSlot:3
LayerJudgeLine:2
LayerStage:0

JudgmentMiss:0
JudgmentPerfect:1
JudgmentGreat:2
JudgmentGood:3

Lanes:12

// Texture identifiers

TextureJudgeLine:41000
TextureSlot:41001
TextureLane:40100
TextureSimLine:12006
TextureSlide:1002
TextureLong:11002
TextureArrow:21001
TextureStageL:40001
TextureStageR:40002
TextureStageCover:42000



// Effect identifiers

EffectMiss:0
EffectPerfect:1
EffectGreat:2
EffectGood:3
EffectFlick:4
EffectEmpty:5



// Particle Effect identifiers

ParticleEffectTapNormalL:120006
ParticleEffectTapNormalC:110006
ParticleEffectTapFlickL:121001
ParticleEffectTapFlickC:111001
ParticleEffectTapHoldL:122002
ParticleEffectTapHoldC:112002
ParticleEffectLaneL:320000
ParticleEffectSlotL:420000



// Block identifiers

LevelMemory:0
LevelData:1
LevelOption:2
LevelTransform:3
LevelBackground:4
LevelUI:5
LevelBucket:6
LevelScore:7
LevelLife:8

EntityInfoArray:10
EntityDataArray:11
EntitySharedMemoryArray:12

EntityInfo:20
EntityMemory:21
EntityData:22
EntityInput:23
EntitySharedMemory:24

ArchetypeLife:30
TemporaryMemory:100
TemporaryData:101



// Level Preprocess Memory Layout

*NoteMinLane:0
*NoteMaxLane:1
*NoteLaneDiff:2
*NoteRefLane:3

NoteMinLane:Get(LevelMemory *NoteMinLane)
NoteMaxLane:Get(LevelMemory *NoteMaxLane)
NoteLaneDiff:Get(LevelMemory *NoteLaneDiff)
NoteRefLane:Get(LevelMemory *NoteRefLane)



// Level Memory Layout

*Tilt:0
*LevelLooper:255

Tilt:Get(LevelMemory *Tilt)
LevelLooper:Get(LevelMemory *LevelLooper)



// Level Data Layout

*Time:0
*DeltaTime:1
*AspectRatio:2
*DeviceAudioOffset:3
*DeviceInputOffset:4

Time:Get(LevelData *Time)
DeltaTime:Get(LevelData *DeltaTime)
AspectRatio:Get(LevelData *AspectRatio)
DeviceAudioOffset:Get(LevelData *DeviceAudioOffset)
DeviceInputOffset:Get(LevelData *DeviceInputOffset)

*LaneBX:64
*LaneTX:80



// Level Option Layout

*Auto:0
*NoteRandom:1
*NoteSpeedRandom:2
*StrictJudgment:3
*LevelAudioOffset:4
*LevelInputOffset:5
*Speed:6
*NoteSpeed:7
*NoteSize:8
*NoteEffectSize:9
*ConnectorAlpha:10
*StageCover:11
*Mirror:12
*SimLine:13
*SoundEffect:14
*NoteEffect:15
*LaneEffect:16
*SlotEffect:17
*StageTilt:18
*StageAspectRatioLock:19
*UIJudgmentSize:20
*UIJudgmentAlpha:21
*UIComboSize:22
*UIComboAlpha:23

Auto:Get(LevelOption *Auto)
NoteRandom:Get(LevelOption *NoteRandom)
NoteSpeedRandom:Get(LevelOption *NoteSpeedRandom)
StrictJudgment:Get(LevelOption *StrictJudgment)
LevelAudioOffset:Get(LevelOption *LevelAudioOffset)
LevelInputOffset:Get(LevelOption *LevelInputOffset)
Speed:Get(LevelOption *Speed)
NoteSpeed:Get(LevelOption *NoteSpeed)
NoteSize:Get(LevelOption *NoteSize)
NoteEffectSize:Get(LevelOption *NoteEffectSize)
ConnectorAlpha:Get(LevelOption *ConnectorAlpha)
StageCover:Get(LevelOption *StageCover)
Mirror:Get(LevelOption *Mirror)
SimLine:Get(LevelOption *SimLine)
SoundEffect:Get(LevelOption *SoundEffect)
NoteEffect:Get(LevelOption *NoteEffect)
LaneEffect:Get(LevelOption *LaneEffect)
SlotEffect:Get(LevelOption *SlotEffect)
StageTilt:Get(LevelOption *StageTilt)
StageAspectRatioLock:Get(LevelOption *StageAspectRatioLock)
UIJudgmentSize:Get(LevelOption *UIJudgmentSize)
UIJudgmentAlpha:Get(LevelOption *UIJudgmentAlpha)
UIComboSize:Get(LevelOption *UIComboSize)
UIComboAlpha:Get(LevelOption *UIComboAlpha)



// Level UI Layout

*UIMenu:0
*UIJudgment:11
*UIComboValue:22
*UIComboText:33
*UIScoreBar:44
*UIScoreValue:55
*UILifeBar:66
*UILifeValue:77

*UIAnchorX:0
*UIAnchorY:1
*UIPivotX:2
*UIPivotY:3
*UIWidth:4
*UIHeight:5
*UIRotation:6
*UIAlpha:7
*UIHorizontalAlign:8
*UIVerticalAlign:9
*UIBackground:10

// Level Score Layout

*PerfectScoreMultiplier:0
*GreatScoreMultiplier:1
*GoodScoreMultiplier:2

*ConsecutivePerfectScore:3
*ConsecutiveGreatScore:6
*ConsecutiveGoodScore:9

*ConsecutiveScoreMultiplier:0
*ConsecutiveScoreStep:1
*ConsecutiveScoreCap:2



// Level Life Layout

*ConsecutivePerfectLife:0
*ConsecutiveGreatLife:2
*ConsecutiveGoodLife:4

*ConsecutiveLifeIncrement:0
*ConsecutiveLifeStep:1



// Archetype Life Layout

*PerfectLifeIncrement:0
*GreatLifeIncrement:1
*GoodLifeIncrement:2
*MissLifeIncrement:3


// Entity Info Layout

*Index:0
*Archetype:1
*State:2

Index:Get(EntityInfo *Index)
Archetype:Get(EntityInfo *Archetype)
State:Get(EntityInfo *State)

AutoNoteArchetype:GetShifted(EntityInfoArray AutoNoteInfoOffset *Archetype)

NoteHeadState:GetShifted(EntityInfoArray NoteHeadInfoOffset *State)

SimLineState1:GetShifted(EntityInfoArray SimLineInfoOffset1 *State)
SimLineState2:GetShifted(EntityInfoArray SimLineInfoOffset2 *State)



// Entity Input Layout

*Judgment:0
*Bucket:1
*BucketValue:2

Judgment:Get(EntityInput *Judgment)
Bucket:Get(EntityInput *Bucket)
BucketValue:Get(EntityInput *BucketValue)



// Touch Temporary Memory Layout

*TempTouchOccupied:0

TempTouchOccupied:Get(TemporaryMemory *TempTouchOccupied)


// Touch Temporary Data Layout

*TempTouchID:0
*TempTouchStarted:1
*TempTouchEnded:2
*TempTouchT:3
*TempTouchST:4
*TempTouchX:5
*TempTouchY:6
*TempTouchSX:7
*TempTouchSY:8
*TempTouchDX:9
*TempTouchDY:10
*TempTouchVX:11
*TempTouchVY:12
*TempTouchVR:13
*TempTouchVW:14

TempTouchID:Get(TemporaryData *TempTouchID)
TempTouchStarted:Get(TemporaryData *TempTouchStarted)
TempTouchEnded:Get(TemporaryData *TempTouchEnded)
TempTouchT:Get(TemporaryData *TempTouchT)
TempTouchST:Get(TemporaryData *TempTouchST)
TempTouchX:Get(TemporaryData *TempTouchX)
TempTouchY:Get(TemporaryData *TempTouchY)
TempTouchSX:Get(TemporaryData *TempTouchSX)
TempTouchSY:Get(TemporaryData *TempTouchSY)
TempTouchDX:Get(TemporaryData *TempTouchDX)
TempTouchDY:Get(TemporaryData *TempTouchDY)
TempTouchVX:Get(TemporaryData *TempTouchVX)
TempTouchVY:Get(TemporaryData *TempTouchVY)
TempTouchVR:Get(TemporaryData *TempTouchVR)
TempTouchVW:Get(TemporaryData *TempTouchVW)



// Common Entity Memory Layout

*Looper:63

Looper:Get(EntityMemory *Looper)



// #1 Memory Layout

*AutoNoteInfoOffset:0
*AutoNoteDataOffset:1
*SlotX1:2
*SlotX2:18
*SlotY1:34
*SlotY2:50

AutoNoteInfoOffset:Get(EntityMemory *AutoNoteInfoOffset)
AutoNoteDataOffset:Get(EntityMemory *AutoNoteDataOffset)



// Note Class Memory Layout

*InputState:32
*ActivationTime:33
*NoteHeadTimeDistance:34
*NoteHeadScale:35
*NoteHeadX:36
*NoteHeadX1:37
*NoteHeadX2:38
*NoteHeadY:39
*NoteTailTimeDistance:40
*NoteTailScale:41
*NoteTailScale1:42
*NoteTailScale2:43
*NoteTailY:44
*NoteTailY1:45
*NoteTailY2:46
*TerminationTime:47

InputState:Get(EntityMemory *InputState)
ActivationTime:Get(EntityMemory *ActivationTime)
NoteHeadTimeDistance:Get(EntityMemory *NoteHeadTimeDistance)
NoteHeadScale:Get(EntityMemory *NoteHeadScale)
NoteHeadX:Get(EntityMemory *NoteHeadX)
NoteHeadX1:Get(EntityMemory *NoteHeadX1)
NoteHeadX2:Get(EntityMemory *NoteHeadX2)
NoteHeadY:Get(EntityMemory *NoteHeadY)
NoteTailTimeDistance:Get(EntityMemory *NoteTailTimeDistance)
NoteTailScale:Get(EntityMemory *NoteTailScale)
NoteTailScale1:Get(EntityMemory *NoteTailScale1)
NoteTailScale2:Get(EntityMemory *NoteTailScale2)
NoteTailY:Get(EntityMemory *NoteTailY)
NoteTailY1:Get(EntityMemory *NoteTailY1)
NoteTailY2:Get(EntityMemory *NoteTailY2)
TerminationTime:Get(EntityMemory *TerminationTime)


// Note Class Shared Memory Layout

*InputSuccess:0
*InputTouchID:1
*HoldEffectLID:2
*HoldEffectCID:3

InputSuccess:Get(EntitySharedMemory *InputSuccess)
InputTouchID:Get(EntitySharedMemory *InputTouchID)
HoldEffectLID:Get(EntitySharedMemory *HoldEffectLID)
HoldEffectCID:Get(EntitySharedMemory *HoldEffectCID)

NoteHeadInputSuccess:GetShifted(EntitySharedMemoryArray NoteHeadSharedMemoryOffset *InputSuccess)
NoteHeadInputTouchID:GetShifted(EntitySharedMemoryArray NoteHeadSharedMemoryOffset *InputTouchID)
NoteHeadHoldEffectLID:GetShifted(EntitySharedMemoryArray NoteHeadSharedMemoryOffset *HoldEffectLID)
NoteHeadHoldEffectCID:GetShifted(EntitySharedMemoryArray NoteHeadSharedMemoryOffset *HoldEffectCID)



// Note Class Data Layout

*NoteHeadIndex:0
*NoteTailTime:1
*NoteTailLane:2
*NoteXSize:3
*NoteRef:4
*NoteHasSimLine:4
*NoteBucket:5
*NoteTexture:6
*NoteTailX:17
*NoteTailX1:18
*NoteTailX2:19
*NoteTailSpeedMultiplier:20
*NoteTailSpawnTime:21
*NoteTailOriginalLane:22

NoteHeadIndex:Get(EntityData *NoteHeadIndex)
NoteTailTime:Get(EntityData *NoteTailTime)
NoteTailLane:Get(EntityData *NoteTailLane)
NoteRef:Get(EntityData *NoteRef)
NoteHasSimLine:Get(EntityData *NoteHasSimLine)
NoteXSize:Get(EntityData *NoteXSize)
NoteBucket:Get(EntityData *NoteBucket)
NoteTexture:Get(EntityData *NoteTexture)
NoteTailX:Get(EntityData *NoteTailX)
NoteTailX1:Get(EntityData *NoteTailX1)
NoteTailX2:Get(EntityData *NoteTailX2)
NoteTailSpeedMultiplier:Get(EntityData *NoteTailSpeedMultiplier)
NoteTailSpawnTime:Get(EntityData *NoteTailSpawnTime)
NoteTailOriginalLane:Get(EntityData *NoteTailOriginalLane)

NoteHeadInfoOffset:Multiply(NoteHeadIndex 3)
NoteHeadDataOffset:Multiply(NoteHeadIndex 32)
NoteHeadSharedMemoryOffset:Multiply(NoteHeadIndex 32)

AutoNoteTailTime:GetShifted(EntityDataArray AutoNoteDataOffset *NoteTailTime)

NoteHeadTime:GetShifted(EntityDataArray NoteHeadDataOffset *NoteTailTime)
NoteHeadLane:GetShifted(EntityDataArray NoteHeadDataOffset *NoteTailLane)
NoteHeadSize:GetShifted(EntityDataArray NoteHeadDataOffset *NoteXSize)
NoteHeadSpeedMultiplier:GetShifted(EntityDataArray NoteHeadDataOffset *NoteTailSpeedMultiplier)
NoteHeadSpawnTime:GetShifted(EntityDataArray NoteHeadDataOffset *NoteTailSpawnTime)
NoteHeadOriginalLane:GetShifted(EntityDataArray NoteHeadDataOffset *NoteTailOriginalLane)

SimLineTime1:GetShifted(EntityDataArray SimLineDataOffset1 *NoteTailTime)
SimLineTime2:GetShifted(EntityDataArray SimLineDataOffset2 *NoteTailTime)
SimLineLane1:GetShifted(EntityDataArray SimLineDataOffset1 *NoteTailLane)
SimLineLane2:GetShifted(EntityDataArray SimLineDataOffset2 *NoteTailLane)



// #7 Memory Layout

*SimLineIndex1:0
*SimLineIndex2:1
*SimLineTime:2
*SimLineX1:3
*SimLineX2:4
*SimLineTimeDistance:5
*SimLineScale:6
*SimLineScale1:7
*SimLineScale2:8
*SimLineY1:9
*SimLineY2:10

SimLineIndex1:Get(EntityMemory *SimLineIndex1)
SimLineIndex2:Get(EntityMemory *SimLineIndex2)
SimLineTime:Get(EntityMemory *SimLineTime)
SimLineX1:Get(EntityMemory *SimLineX1)
SimLineX2:Get(EntityMemory *SimLineX2)
SimLineTimeDistance:Get(EntityMemory *SimLineTimeDistance)
SimLineScale:Get(EntityMemory *SimLineScale)
SimLineScale1:Get(EntityMemory *SimLineScale1)
SimLineScale2:Get(EntityMemory *SimLineScale2)
SimLineY1:Get(EntityMemory *SimLineY1)
SimLineY2:Get(EntityMemory *SimLineY2)

SimLineInfoOffset1:Multiply(SimLineIndex1 3)
SimLineInfoOffset2:Multiply(SimLineIndex2 3)
SimLineDataOffset1:Multiply(SimLineIndex1 32)
SimLineDataOffset2:Multiply(SimLineIndex2 32)



// #8 Memory Layout

*CompanionHasHead:0
*CompanionHeadTime:1
*CompanionHeadLane:2
*CompanionHeadSize:3
*CompanionIsFlick:4
*CompanionTailTime:5
*CompanionTailLane:6
*CompanionTailSize:7
*CompanionTailX:8
*CompanionHeadX:9
*CompanionHeadCurrentX:10
*CompanionHoldEffectLID:11
*CompanionHoldEffectCID:12
*CompanionHeadCurrentX1:13
*CompanionHeadCurrentX2:14


CompanionHasHead:Get(EntityMemory *CompanionHasHead)
CompanionHeadTime:Get(EntityMemory *CompanionHeadTime)
CompanionHeadLane:Get(EntityMemory *CompanionHeadLane)
CompanionHeadSize:Get(EntityMemory *CompanionHeadSize)
CompanionIsFlick:Get(EntityMemory *CompanionIsFlick)
CompanionTailTime:Get(EntityMemory *CompanionTailTime)
CompanionTailLane:Get(EntityMemory *CompanionTailLane)
CompanionTailSize:Get(EntityMemory *CompanionTailSize)
CompanionTailX:Get(EntityMemory *CompanionTailX)
CompanionHeadX:Get(EntityMemory *CompanionHeadX)
CompanionHeadCurrentX:Get(EntityMemory *CompanionHeadCurrentX)
CompanionHoldEffectLID:Get(EntityMemory *CompanionHoldEffectLID)
CompanionHoldEffectCID:Get(EntityMemory *CompanionHoldEffectCID)
CompanionHeadCurrentX1:Get(EntityMemory *CompanionHeadCurrentX1)
CompanionHeadCurrentX2:Get(EntityMemory *CompanionHeadCurrentX2)
`