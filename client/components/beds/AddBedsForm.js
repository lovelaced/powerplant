import React from 'react';
import ChooseCrops from '../crops/ChooseCrops';
import CropGroups from '../crops/CropGroups';
import { Button } from 'react-bootstrap'
import { getCropGroups } from '../../utils/apiCalls';
import { withRouter } from 'react-router-dom';

class AddBedForm extends React.Component {
	constructor(props){
		super(props);
		this.onChangeChooseCrop = this.onChangeChooseCrop.bind(this);
		this.onChangeCropGroups = this.onChangeCropGroups.bind(this);
		this.onSubmit = this.onSubmit.bind(this);
		this.chosenBeds = [];
		//this.onSuccess;

		this.state = {
			chosenCrops : [],
			loadingGroups : false,
			groups : [],
			groupsError : false,
			savingError : false,
		}
	}

	getGroups(cropIds){
		this.setState({
			loadingGroups : true
		});
		getCropGroups(
			{ cropIds }
		).then(res => {
			this.setState({
				groups : res.data,
				loadingGroups : false
			});
		}).catch(error => {
			this.setState({
				groupsError : res,
				loadingGroups : false
			});
		});
	}

	onSubmit(e){
		e.preventDefault();
		//TODO: VALIDATE PLANTS
		let createPromises=[];
		this.chosenBeds.forEach((crops,index) => {
			let genName = '';
			crops.forEach((crop)=>{
				genName+=crop.commonName.slice(0,2);
			})
			//create beds from
			createPromises.push(this.props.onSubmit({
				name : genName,
				crops
			}));
		});
		Promise.all(createPromises).then(
			()=> this.props.onSuccess()
		).catch(err => {
			this.setState({
				savingError: { form : 'Error saving beds'}
			})
		});

	}

	onChangeChooseCrop(chosenCrops){
	  this.setState({
			chosenCrops
		});
		const cropIds = chosenCrops.map((crop)=>{
			return crop._id;
		})
		if( chosenCrops.length >= this.props.minNumberOfCrops ){
			this.getGroups(cropIds);
		}
	};

	onChangeCropGroups(chosenGroups){
		this.chosenBeds = chosenGroups;
	};

	cropGroups(){
		if ( this.state.chosenCrops.length < this.props.minNumberOfCrops ) {
			return (<p>{this.props.minNumberOfCropsText}</p>);
		} else {
			return (<CropGroups
		  	error={this.state.groupsError}
		  	loading={this.state.loadingGroups}
		  	groups={this.state.groups}
		  	onChange={this.onChangeCropGroups}
		  />);
		}
	}

	render(){
		this.chosenBeds = this.state.groups;
		return (
			<form onSubmit={this.onSubmit}>
			  <div>{this.props.explanation}</div>
				<div className="choose-crops">
			  	<ChooseCrops onChange={this.onChangeChooseCrop}/>
			  </div>
			  {this.cropGroups()}
			  <div className="button-checkbox-center" >
					<Button
						type="submit"
						className="btn btn-primary"
						disabled={this.state.groups.length===0}
					>{this.props.submitButtonText}</Button>
				</div>
			</form>
		);
	}
}

AddBedForm.defaultProps = {
	minNumberOfCrops : 3,
	submitButtonText : "Submit",
	minNumberOfCropsText : "(select at least 3 crops!)",
	explanation : "Choose which crops you'd like to plant in your garden, and we'll suggest a bed plan based on plant compatibility."
}

export default withRouter(AddBedForm);
