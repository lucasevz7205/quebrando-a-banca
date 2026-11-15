Labelled select for filters (matéria, status, período) and the Arquiteto context pickers.

```jsx
<SelectField label="Matéria" value={subj} onChange={setSubj} options={[{ value: 'all', label: 'Todas as matérias' }, …]} />
<SelectField label="Assunto / tópico" value={t} onChange={setT} options={[{ label: 'P1 · Conhecimentos básicos', options: [...] }]} />
```
