import axios from 'axios'

const api = axios.create({
    baseURL: 'https://captacao-aks-stg.krthomolog.com.br/gerador/massa/ingresso/'
})

export default api