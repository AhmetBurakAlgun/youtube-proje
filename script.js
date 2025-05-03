import { formatters } from './utils/formatters.js';

function displayChannelData(channelData) {
  if (descSubscriber) {
    descSubscriber.textContent = formatters.number(aboneSayisi);
    console.log('Abone sayısı gösterildi:', formatters.number(aboneSayisi));
  }
  
  if (descViews) {
    descViews.textContent = formatters.number(izlenmeSayisi);
    console.log('İzlenme sayısı gösterildi:', formatters.number(izlenmeSayisi));
  }
  
  if (descVideos) {
    descVideos.textContent = formatters.number(videoSayisi);
    console.log('Video sayısı gösterildi:', formatters.number(videoSayisi));
  }
  
  if (descAge && publishedAt) {
    const channelAge = formatters.channelAge(publishedAt);
    descAge.textContent = channelAge;
    descAge.setAttribute('title', `Kuruluş: ${formatters.date(publishedAt)}`);
  }
  
  if (subscriber) subscriber.innerHTML = '<h6>Abone Sayısı</h6>' + formatters.number(aboneSayisi);
  if (totalviews) totalviews.innerHTML = '<h6>Toplam İzlenme</h6>' + formatters.number(izlenmeSayisi);
  if (totalvideos) totalvideos.innerHTML = '<h6>Toplam Video</h6>' + formatters.number(videoSayisi);
} 