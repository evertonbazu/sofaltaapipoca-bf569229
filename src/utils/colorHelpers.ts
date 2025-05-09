
/**
 * Parses subscription title to determine appropriate colors
 * @param title The subscription title
 * @returns Header and price color values
 */
export const parseSubscriptionColorFromTitle = (title: string): { headerColor: string, priceColor: string } => {
  const titleLower = title.toLowerCase();
  
  // Default colors
  let headerColor = 'bg-blue-600';
  let priceColor = 'text-blue-600';
  
  // Streaming services
  if (titleLower.includes('netflix')) {
    headerColor = 'bg-red-600';
    priceColor = 'text-red-600';
  } else if (titleLower.includes('amazon') || titleLower.includes('prime')) {
    headerColor = 'bg-blue-700';
    priceColor = 'text-blue-700';
  } else if (titleLower.includes('disney')) {
    headerColor = 'bg-indigo-600';
    priceColor = 'text-indigo-600';
  } else if (titleLower.includes('paramount')) {
    headerColor = 'bg-blue-500';
    priceColor = 'text-blue-500';
  } else if (titleLower.includes('hbo') || titleLower.includes('max')) {
    headerColor = 'bg-purple-600';
    priceColor = 'text-purple-600';
  } else if (titleLower.includes('globo')) {
    headerColor = 'bg-blue-600';
    priceColor = 'text-blue-600';
  } else if (titleLower.includes('youtube')) {
    headerColor = 'bg-red-600';
    priceColor = 'text-red-600';
  } else if (titleLower.includes('spotify')) {
    headerColor = 'bg-green-600';
    priceColor = 'text-green-600';
  } else if (titleLower.includes('apple')) {
    headerColor = 'bg-gray-800';
    priceColor = 'text-gray-800';
  } else if (titleLower.includes('canva')) {
    headerColor = 'bg-blue-400';
    priceColor = 'text-blue-400';
  } else if (titleLower.includes('microsoft') || titleLower.includes('365')) {
    headerColor = 'bg-blue-500';
    priceColor = 'text-blue-500';
  } else if (titleLower.includes('crunchyroll')) {
    headerColor = 'bg-orange-500';
    priceColor = 'text-orange-500';
  } else if (titleLower.includes('mubi')) {
    headerColor = 'bg-black';
    priceColor = 'text-black';
  } else if (titleLower.includes('mcafee')) {
    headerColor = 'bg-red-700';
    priceColor = 'text-red-700';
  } else if (titleLower.includes('perplexity')) {
    headerColor = 'bg-purple-500';
    priceColor = 'text-purple-500';
  } else if (titleLower.includes('babbel')) {
    headerColor = 'bg-blue-600';
    priceColor = 'text-blue-600';
  } else if (titleLower.includes('cursos') || titleLower.includes('alura')) {
    headerColor = 'bg-indigo-700';
    priceColor = 'text-indigo-700';
  } else if (titleLower.includes('google')) {
    headerColor = 'bg-green-500';
    priceColor = 'text-green-500';
  }
  
  return { headerColor, priceColor };
};
