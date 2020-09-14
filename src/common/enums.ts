export enum ChartElementType {
    System = 'System',
    Note = 'Note'
}

export enum NoteType {
    Single = 'Single',
    Slide = 'Slide',
    Long = 'Long'
}

export type NoteLane = 1|2|3|4|5|6|7

export enum SlideNotePos {
    A = 'A',
    B = 'B'
}

export enum RangeSelectorOption {
    Note = 'Note',
    Beat = 'Beat',
    //Prev = 'Prev'
}

export enum PositionSelectorOption {
    Note = 'Note',
    Beat = 'Beat',
    Relative = 'Relative'
}

export enum PlacementType {
    Place = 'Place',
    Replace = 'Replace',
    Insert = 'Insert'
}

export enum Interval {
    Two = 2,
    One = 1,
    Half = 1/2,
    Triplet = 1/3,
    Quarter = 1/4,
    Sixth = 1/6,
    Eighth = 1/8,
    Twelfth = 1/12,
    Sixteenth = 1/16,
    Twentyfourth = 1/24,
    Thirtysecond = 1/32,
}

export enum Operation {
    Move = 'Move',
    Copy = 'Copy',
    Mirror = 'Mirror',
    Reverse = 'Reverse',
    Shift = 'Shift',
    ConvertToFlick = 'Convert To Flick',
    SetInitialBpm = 'Set Initial BPM',
    GenerateTapPattern = 'Tap Ptn.',
    GenerateASlidePattern = 'A Slide',
    GenerateBSlidePattern = 'B Slide',
}