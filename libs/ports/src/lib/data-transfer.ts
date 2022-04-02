import { DataTransferMap } from './interfaces/data-transfer-map';
import { EventEmitter } from './interfaces/event-emitter';


export abstract class DataTransfer<T extends DataTransferMap> {
  abstract event: EventEmitter<T>;
}
