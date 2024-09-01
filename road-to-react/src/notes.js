const styles = require('./App.module.css');
const Check = require('./logo.svg').default;
const React = require('react');
const axios = require('axios'); //book had old definition of how to import.


//potential in enzyme for testing
// className
//can remove paranthesis in arrow functions if only one item.
//can remove curly braces if only returns.
//return is implied for such simple systems.
//const title = 'React'; //defined outside the function as it will be re-rendered if defined inside.
// can use typescript in react
//unionn types 

/* const welcome = {
  greeting: 'Hey', 
  title: 'react',
}; 
*/

/*
function getTitle( title ){
  return title;
}
*/

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

const storiesReducer = (state, action) => {
  switch( action.type ){
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      }
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true,
      }
    case 'REMOVE_STORY':
      return {
        ...state,
        data: state.data.filter((story)  => action.payload.objectID !== story.objectID)
      }
    default:
      throw new Error();
  }

  /*
  if( action.type === 'SET_STORIES'){
    return action.paylaod;
  }else if( action.type === 'REMOVE_STORY'){
    return state.filter((story) => action.payload.objectID !== story.objectID);
  }else{
    throw new Error();
  }
  */
};

 const useSemiPersistentState = (key, initialState) => {

  const isMounted = React.useRef(false);
  const [ value, setValue ] = React.useState(
    localStorage.getItem(key) || initialState
  );

  React.useEffect(() => {
    if(!isMounted.current){
      isMounted.current = true;
    }else{
    localStorage.setItem(key, value);
    }
  }, [value, key]);

  return [value, setValue];
};


const getSumComments = (stories) => {
 console.log('C');

 return stories.data.reduce( (result, value) => result + value.num_comments, 0 );
}




//object destructuring

//function App(){}
const App = () => {



  /*
  const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abromov, Andrew Clark',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
]
*/

/*
const getAsyncStories = () =>
  new Promise  ((resolve) => setTimeout(() => resolve({data: {stories: initialStories}}), 2000));
*/

//const [searchTerm, setSearchTerm] = React.useState(localStorage.getItem('search') || 'React');
const [searchTerm, setSearchTerm] = useSemiPersistentState('search', 'React');


//const [stories, dispatchStories] = React.useReducer(storiesReducer, []);
//const [ isLoading, setIsLoading ] = React.useState(false);
//const [ isError, setIsError] = React.useState(false);
const [stories, dispatchStories] = React.useReducer(storiesReducer,  {data: [], isLoading: false, isError: false});

const [url, setUrl] = React.useState(`${API_ENDPOINT}${searchTerm}`);

const handleSearchInput = (event) => {
setSearchTerm(event.target.value);
};

const handleSearchSubmit = (event) => {
  setUrl( `${API_ENDPOINT}${searchTerm}`  );

  event.preventDefault();
  
};


const handleFetchStories = React.useCallback(async () => {
  dispatchStories({ type: 'STORIES_FETCH_INIT'});

  try{
  const result = await axios.get( url );

  dispatchStories({
    type: 'STORIES_FETCH_SUCCESS',
    payload: result.data.hits,
  });
} catch {
  dispatchStories({ type: 'STORIES_FETCH_FAILURE'});
}

 /* axios.get(url).then(result => {
    dispatchStories({
      type: 'STORIES_FETCH_SUCCESS',
      payload: result.data.hits,
    });
}).catch(() => dispatchStories({type: 'STORIES_FETCH_FAILURE'})); */

}, [url]);


React.useEffect(() => {
  handleFetchStories();
}, [handleFetchStories]);

const handleRemoveStory = React.useCallback((item) => {
dispatchStories({
  type: 'REMOVE_STORY',
  payload: item,
});
},[]);


const sumComments = React.useMemo(() => getSumComments(stories) , [stories,]);

/*
React.useEffect(()=>{
    localStorage.setItem('search', searchTerm);
  }, [searchTerm]);
*/

/*
const handleSearch = (event) => {
    setSearchTerm( event.target.value );
    //console.log( event.target.value );

    localStorage.setItem( 'search', event.target.value );
  }

*/

  /*
  const searchedStories = stories.data.filter( function (story) {
    return story.title && story.title.toLowerCase().includes(searchTerm.toLowerCase());
  });
  */
  //You can do something in between 
  //const title = 'React';

  /* return (
    <div>
      <h1> Hello World </h1>
    </div>
  ); */

  return (
    <div className="container">
      <h1 className="headline-primary">My Hacker Stories with {sumComments} comments.</h1>

      <SearchForm
        searchTerm={searchTerm}
        onSearchInput={handleSearchInput}
        onSearchSubmit={handleSearchSubmit}
      />

      {stories.isError && <p>Something went wrong ...</p>}

      {stories.isLoading ? (
        <p>Loading ...</p>
      ) : (
        <List list={stories.data} onRemoveItem={handleRemoveStory} />
      )}
    </div>
  );
}

//use of destructuring here.
const List = React.memo( ({list, onRemoveItem}) => console.log("B:List") || (
    <ul>
        {list.map( (item) => (
          <Item key = {item.objectID} item = {item} onRemoveItem = {onRemoveItem} />
        ))}
        {/* spread operator bit confusing how it does this. */}
      </ul>
      )
);

const InputWithLabel = ({
  id,
  value,
  type = 'text',
  onInputChange,
  isFocused,
  children,
}) => {
  const inputRef = React.useRef();
  //synthetic event
  //const [searchTerm, setSearchTerm] = React.useState(''); //react hooks

  /*
  const handleChange = (event) => {
    setSearchTerm( event.target.value );
    //console.log(event.target.value);
    props.onSearch( event );
  }
  */
  React.useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);

  return (
    <>
      <label htmlFor={id} className={styles.label}>
        {children}
      </label>
      &nbsp;
      <input
        id={id}
        ref={inputRef}
        type={type}
        value={value}
        onChange={onInputChange}
        className={styles.input}
      />
    </>
  );
};


//nested desttructuring can be used here.
const Item = ({ item, onRemoveItem }) => (
  <li className="item">
    <span style={{ width: '40%' }}>
      <a href={item.url}>{item.title}</a>
    </span>
    <span style={{ width: '30%' }}>{item.author}</span>
    <span style={{ width: '10%' }}>{item.num_comments}</span>
    <span style={{ width: '10%' }}>{item.points}</span>
    <span style={{ width: '10%' }}>
      <button
        type="button"
        onClick={() => onRemoveItem(item)}
        className="button button_small"
      >
        <Check height = "18px" width = "18px" />
      </button>
    </span>
  </li>
);

const SearchForm = ({
  searchTerm,
  onSearchInput,
  onSearchSubmit,
}) => (
  <form onSubmit={onSearchSubmit} className="search-form">
    <InputWithLabel
      id="search"
      value={searchTerm}
      isFocused
      onInputChange={onSearchInput}
    >
      <strong>Search:</strong>
    </InputWithLabel>

    <button
      type="submit"
      disabled={!searchTerm}
      className="button button_large"
    >
      Submit
    </button>
  </form>
);

export default App;



export {
  storiesReducer, SearchForm, InputWithLabel, List, Item
};
