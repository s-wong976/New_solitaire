import VARS from '../utils/Vars.js';
import Utils from '../utils/Utils.js';
import FlipPile from '../visualAssets/FlipPile.js';
import DragContainer from '../visualAssets/DragContainer.js';

const MoveCard = {
  // Function to check if the active card can be moved to a target card
  moveCardListener: function(activeCard) {
    let possibleDestinationCards = [...VARS.slots, ...Object.keys(VARS.piles).map(item => Utils.returnLastArrayItem(VARS.piles[item]))];
    
    // Find a valid target card based on collision detection and move rules
    let target = possibleDestinationCards.find(card => {
      if (Utils.rectangleRectangleCollisionDetection(card, activeCard)) {
        let alternatingSuitAndOneLower = (card.color !== activeCard.color && card.rank === (activeCard.rank + 1));
        let slotHit = card.rank === activeCard.rank && card.suit === activeCard.suit && card.slot && DragContainer.length() === 1;
        
        // Allow the move if it's a king on an empty tableau slot
        if (slotHit || alternatingSuitAndOneLower || (card.marker && activeCard.rank === 13 && !card.card)) {
          return true;
        }
      }
    });
    
    // Return the target card if found along with a flag indicating a valid move
    return target ? { hit: true, target } : { hit: false };
  },
  
  // Function to perform the move of the active card to the target card
  moveCard: function(target, activeCard) {
    let { x, y, _index: pileKey, slot, marker } = target;
    let { _index, flipPile } = activeCard;
    let markerAdjust = marker ? 0 : 1;
    
    let tempArray = !flipPile ? VARS.piles[_index] : FlipPile.arr;
    
    // Move the cards from DragContainer to the target position
    DragContainer.arr.forEach((card, i) => {
      tempArray.splice(tempArray.indexOf(card), 1);
      let yPos = y;
      
      if (!slot) {
        // If the move is to a tableau pile, update the pile and card positions accordingly
        VARS.piles[pileKey].push(card);
        card.setIndex(+pileKey);
        yPos = y + VARS.spacing.buffer_larger * (i + markerAdjust);
      } else {
        // If the move is to a slot, increase the rank of the slot and disable clickability of the card
        target.increaseSlotRank();
        card.setClickability(false);
      }
      
      card.setPosition({ x, y: yPos });
    });
    
    // Reveal the next card in the array if applicable
    this.revealNextCard(tempArray);
  },
  
  // Function to reveal the next card in the array
  revealNextCard: function(arr) {
    if (arr.length) {
      let newTopCard = Utils.returnLastArrayItem(arr);
      if (!newTopCard.marker) {
        newTopCard.reveal(true);
        newTopCard.setClickability(true);
      }
    }
  }
};

export default MoveCard;
