import axios from 'axios'

const api = axios.create({
    baseURL: 'https://captacao-aks-stg.krthomolog.com.br/gerador/massa/ingresso/'
})

const api_vestibular = axios.create({
    baseURL: 'http://rabbitmq-hml.krthomolog.com.br:666/api/exchanges/%2F/mcr-exchange-ranqueamento-resultado_classificacao/publish'
})

export default api