module.exports = function response(data={}) {
  return {
    alert_type: data.alert_type,
    priority: data.priority,
    tags: data.tags || [],
    text: data.text,
    title: data.title,
    ...data.aggregation_key && { aggregation_key: data.aggregation_key },
    ...data.date_happened && { date_happened: data.date_happened },
    ...data.host && { host: data.host },
    ...data.source_type_name && { source_type_name: data.source_type_name }
  };
};
