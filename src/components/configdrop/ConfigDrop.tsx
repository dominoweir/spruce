import { Card, CardContent, IconButton, Snackbar } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { DropzoneArea } from "material-ui-dropzone";
import * as React from "react";
import {
  ClientConfig,
  ConvertToClientConfig
} from "../../models/client_config";
import "../../styles.css";

class Props {
  public updateClientConfig: (configObj: ClientConfig) => void;
  public onLoadFinished: () => void;
}

interface State {
  snackbarOpen: boolean;
  snackbarMessage: string;
  error: string;
  newConfig: ClientConfig;
}

export class ConfigDrop extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      snackbarOpen: false,
      snackbarMessage: "",
      error: null,
      newConfig: null
    };
  }

  public componentDidUpdate(prevProps: Props, prevState: State) {
    if (
      prevState.newConfig !== this.state.newConfig &&
      this.props.onLoadFinished !== null
    ) {
      this.props.onLoadFinished();
    }
  }

  public render() {
    return (
      <div>
        <Card>
          <CardContent>
            <DropzoneArea
              onChange={this.handleDropAreaChange}
              dropzoneText={"Drop your config file here"}
              filesLimit={1}
              acceptedFiles={["application/json"]}
            />
          </CardContent>
        </Card>
        <Snackbar
          open={this.state.snackbarOpen}
          message={this.state.snackbarMessage}
          anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
          onClose={this.onCloseSnackbar}
          action={[
            <IconButton
              key="close"
              color="inherit"
              onClick={this.onCloseSnackbar}
            >
              <CloseIcon />
            </IconButton>
          ]}
        />
      </div>
    );
  }

  private handleDropAreaChange = (fileArray: File[]) => {
    if (fileArray.length !== 0) {
      this.readConfig(fileArray[0]);
    } else {
      this.setState({
        newConfig: null
      });
    }
  };

  private readConfig = (file: File) => {
    const reader = new FileReader();
    reader.onerror = () => {
      this.setState({
        snackbarMessage:
          "Failed to read config file with error " + reader.error,
        snackbarOpen: true
      });
    };
    reader.onload = () => {
      const raw = reader.result.toString();
      const configObj = ConvertToClientConfig(raw);
      if (
        configObj.hasOwnProperty("ui_url") &&
        configObj.hasOwnProperty("api_url")
      ) {
        this.setState({
          newConfig: configObj
        });
        this.props.updateClientConfig(configObj);
      } else {
        this.setState({
          snackbarMessage:
            "Config file does not contain all required properties.",
          snackbarOpen: true
        });
      }
    };
    reader.readAsText(file);
  };

  private onCloseSnackbar = (
    event: React.SyntheticEvent | React.MouseEvent,
    reason?: string
  ) => {
    this.setState({
      snackbarOpen: false
    });
  };
}

export default ConfigDrop;
