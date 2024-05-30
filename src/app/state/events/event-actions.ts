import {createActionGroup, emptyProps, props} from "@ngrx/store";

export const BehaviorActions = createActionGroup({
  source: 'Behavior',
  events: {
    articleRead: props<{id: string, category: string}>(),
    goalFinished: props<{category: string, success: boolean}>(),
    quizFinished: props<{id: string, category: string}>(),
    sessionStarted: emptyProps(),
    hasSuggestedGoals: props<{exist: boolean}>(),
  }
});

export const AwardsActions = createActionGroup({
  source: 'Awards',
  events: {
    grantAward: props<{kind: string}>(),
    satisfiedAwardCondition: props<{kind: string, ordinal: number, condition: string}>(),
  }
});
