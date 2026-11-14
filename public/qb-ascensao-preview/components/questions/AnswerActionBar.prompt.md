Question action bar — confirm/next primary on the right, review + skip on the left, keyboard hints in mono.

```jsx
<AnswerActionBar state={answer ? 'ready' : 'idle'} onConfirm={confirm} onSkip={skip} onReview={mark} sticky />
<AnswerActionBar state="loading" />
<AnswerActionBar state="answered" onNext={next} onOpenFeedback={openDrawer} />
```

- `allowSkip={false}` in simulado mode.
- Keyboard: C / E answer, Enter confirms — hint text documents this.
