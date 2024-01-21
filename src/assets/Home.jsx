import React, { useState, useEffect } from 'react';

const SearchForm = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [food, setFood] = useState({});
  const [translatedDescription, setTranslatedDescription] = useState('');

  useEffect(() => {
    // Verifica se há nutrientes antes de acessá-los
    if (food.foodNutrients && food.foodNutrients.length > 0) {
      console.log(food);

      // Traduzindo food.description
      const translateDescription = async () => {
        const translationApiKey = 'AIzaSyDF-YMT1ixrAuek57NpsvrgttgZQacuDyM';
        const translatedDescription = await translateText(food.description, 'pt', translationApiKey);
        setTranslatedDescription(translatedDescription);
      };

      translateDescription();
    }
  }, [food]); // Executa sempre que food é alterado

  
  const handleSearch = async () => {
    try {
      const translationApiKey = 'AIzaSyDF-YMT1ixrAuek57NpsvrgttgZQacuDyM';
      const targetLanguage = 'en';  // Código para inglês

      // Traduzindo a consulta de pesquisa para inglês
      const translatedQuery = await translateText(searchQuery, targetLanguage, translationApiKey);

      // Fazendo a requisição com a consulta traduzida
      const response = await fetch(
        `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=BeZNr3bUCImQZZFnaqtKCllDIKSFaGr9ECvIBZ0Y&query=${translatedQuery}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar dados');
      }

      const data = await response.json();
      setSearchResult(data);

      if (data.foods && data.foods.length > 0) {
        setFood(data.foods[0]);
        console.log(food)

        // Traduzindo food.description
        const translatedDescription = await translateText(data.foods[0].description, 'pt', translationApiKey);
        setTranslatedDescription(translatedDescription);
      } else {
        setFood({});
        setTranslatedDescription('');
      }

    } catch (error) {
      console.error('Erro:', error.message);
      setSearchResult(null);
    }
  };

  const translateText = async (text, targetLanguage, apiKey) => {
    try {
      const encodedText = encodeURIComponent(text);
      const translationResponse = await fetch(
        `https://translation.googleapis.com/language/translate/v2?key=${apiKey}&q=${encodedText}&target=${targetLanguage}`
      );

      if (!translationResponse.ok) {
        throw new Error('Erro na tradução');
      }

      const translationData = await translationResponse.json();
      return translationData.data.translations[0].translatedText;

    } catch (error) {
      console.error('Erro na tradução:', error.message);
      return '';
    }
  };

  const findNutrientByName = (nutrientName) => {
    console.log('food:', food);
    
    const nutrient = food.foodNutrients.find((nutrient) => nutrient.nutrientName === nutrientName);
    
    if (nutrient) {
      if (food.foodMeasures.length === 0) {
        // Se não houver informações de medidas, assume-se que seja uma unidade padrão
        return nutrient.value;
      } else {
        // Assumindo que a porção padrão é a primeira na lista
        const defaultMeasure = food.foodMeasures[0];
        const amount = defaultMeasure ? defaultMeasure.gramWeight : 100; // Padrão para 100g se a medida padrão não estiver disponível
  
        // Calculando o valor do nutriente para a quantidade padrão
        const valueForDefaultAmount = (nutrient.value * amount) / 100;
  
        return valueForDefaultAmount;
      }
    } else {
      return 'N/A';
    }
  };
    

  return (
    <div>
      <input
        type="text"
        placeholder="Digite sua pesquisa"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button onClick={handleSearch}>OK</button>

      {food && Object.keys(food).length > 0 && (
        <div>
          <h2>Informações sobre o alimento:</h2>
          <p>Nome: {translatedDescription || 'N/A'}</p>
          <p>Calorias: {findNutrientByName('Energy')?.value || 'N/A'} KCAL</p>
          <p>Proteína: {findNutrientByName('Protein')?.value || 'N/A'} G</p>
          <p>Carboidratos: {findNutrientByName('Carbohydrate, by difference')?.value || 'N/A'} G</p>
          <p>Lipídios: {findNutrientByName('Total lipid (fat)')?.value || 'N/A'} G</p>
        </div>
      )}
    </div>
  );
};

export default SearchForm;