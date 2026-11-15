Searchable hierarchical topic picker for Estudo / Mapas mentais (use instead of a long `<select>`; SelectField stays for short lists).

```jsx
<StudyTopicPicker label="Assunto do mapa" subjects={edital.subjects} value={topicId}
  counts={mapCountByTopic} recents={recentTopicIds}
  onSelect={({ subjectId, topicId }) => openMap(topicId)} />
```

- Pass `counts`, `recents`, `favorites`, `pendingReviews` only from real data; empty lists hide the section.
- `onSelect` returns ids only; open exactly that topic's map and show a "sem vínculo" state if none exists.
